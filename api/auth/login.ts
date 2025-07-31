import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔐 Login attempt started');
    console.log('📧 Request body:', { email: req.body?.email, hasPassword: !!req.body?.password });
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('🔍 Checking database connection...');
    
    // Test database connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    try {
      // Get user from database
      console.log('🔍 Searching for user:', email);
      const userResult = await db.select().from(users).where(eq(users.email, email));
      
      if (userResult.length === 0) {
        console.log('❌ User not found:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = userResult[0];
      console.log('✅ User found:', { id: user.id, email: user.email, hasPassword: !!user.password });

      // Check if user has password
      if (!user.password) {
        console.log('❌ User has no password (OAuth only):', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      console.log('🔑 Verifying password...');
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        console.log('❌ Invalid password for user:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      console.log('✅ Login successful for user:', email);
      
      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        user: userWithoutPassword,
        message: 'Login successful'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Login error:', error);
    
    // More detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 