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
    console.log('📝 Registration attempt started');
    
    const { email, password, firstName, lastName, phone } = req.body;
    
    if (!email || !password || !firstName || !lastName || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    console.log('📧 Registration attempt for:', email);

    // Check environment variables
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found');
      return res.status(500).json({ error: 'Database configuration missing' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not found');
      return res.status(500).json({ error: 'JWT configuration missing' });
    }

    console.log('✅ Environment variables check passed');
    
    // Connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    
    try {
      // Check if user already exists
      const existingUserResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUserResult.rows.length > 0) {
        console.log('❌ User already exists:', email);
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      console.log('✅ Email is available:', email);

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      console.log('✅ Password hashed');

      // Insert new user
      const insertResult = await client.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, phone, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, email, first_name, last_name, is_admin',
        [email.toLowerCase(), passwordHash, firstName, lastName, phone]
      );

      const newUser = insertResult.rows[0];
      console.log('✅ User created:', { id: newUser.id, email: newUser.email });

      // Generate JWT token
      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        isAdmin: newUser.is_admin
      });

      console.log('✅ JWT token generated for new user:', newUser.id);

      // Return user data and token
      const responseData = {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          isAdmin: newUser.is_admin
        }
      };

      console.log('📤 Sending registration response:', responseData);
      res.status(201).json(responseData);

    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 