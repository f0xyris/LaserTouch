import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

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
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check environment variables
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found');
      return res.status(500).json({ error: 'Database configuration missing' });
    }

    // Connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    
    try {
      // Find user by email
      const userResult = await client.query(
        'SELECT id, email, first_name, last_name, password, is_admin FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ 
          error: 'Invalid email or password',
          debug: 'User not found in database'
        });
      }

      const user = userResult.rows[0];

      // For testing, let's just return user info without password verification
      const responseData = {
        message: 'Test login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isAdmin: user.is_admin
        },
        debug: {
          hasPassword: !!user.password,
          passwordLength: user.password ? user.password.length : 0
        }
      };

      res.status(200).json(responseData);

    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Test login error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 