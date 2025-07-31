import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    try {
      console.log('🔍 Searching for user:', email);
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
        passwordLength: user.password ? user.password.length : 0,
        passwordStart: user.password ? user.password.substring(0, 10) + '...' : 'null'
      });
      
      if (!user.password) {
        console.log('❌ User has no password (OAuth only):', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      console.log('🔑 Verifying password...');
      console.log('📝 Input password length:', password.length);
      console.log('🗄️ Stored password hash length:', user.password.length);
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🔍 Password comparison result:', isValidPassword);
      
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
      
      console.log('🎫 JWT token generated');
      
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