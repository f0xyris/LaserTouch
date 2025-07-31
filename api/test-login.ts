import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Test login attempt');
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    console.log('📧 Testing with email:', email);
    console.log('🔑 Password length:', password.length);

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    
    try {
      const userResult = await client.query(
        'SELECT id, email, password, first_name, last_name, is_admin FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: user.is_admin
      });

      if (!user.password) {
        return res.status(401).json({ error: 'User has no password (OAuth only)' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🔍 Password check result:', isValidPassword);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      console.log('✅ Login successful!');
      
      res.status(200).json({
        success: true,
        message: 'Login test successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isAdmin: user.is_admin
        }
      });

    } finally {
      client.release();
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Test login error:', error);
    res.status(500).json({ 
      error: 'Test login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 