import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';

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
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('📧 Login attempt for:', email);
    console.log('🔑 Password length:', password.length);

    // Check environment variables
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found');
      return res.status(500).json({ error: 'Database configuration missing' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not found');
      return res.status(500).json({ error: 'JWT configuration missing' });
    }

    // Connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    try {
      // Get user from database
      const userResult = await client.query(
        'SELECT id, email, password, first_name, last_name, profile_image_url, google_id, phone, is_admin FROM users WHERE email = $1',
        [email]
      );
      
      if (userResult.rows.length === 0) {
        console.log('❌ User not found:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      const user = userResult.rows[0];
      console.log('✅ User found:', { 
        id: user.id, 
        email: user.email, 
        hasPassword: !!user.password,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: user.is_admin
      });
      
      if (!user.password) {
        console.log('❌ User has no password (OAuth only):', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🔍 Password verification result:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('❌ Invalid password for user:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      console.log('✅ Login successful for user:', email);
      
      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: user.is_admin
      });
      
      console.log('🎫 JWT token generated successfully');
      
      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      
      // Set token in cookie
      res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/`);
      
      res.status(200).json({ 
        user: userWithoutPassword, 
        token,
        message: 'Login successful' 
      });
      
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Login error:', error);
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