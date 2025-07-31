import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🧪 Database connection test started');
    
    // Check environment variables
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found');
      return res.status(500).json({ 
        error: 'Database configuration missing',
        envVars: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          JWT_SECRET: !!process.env.JWT_SECRET,
          NODE_ENV: process.env.NODE_ENV
        }
      });
    }

    console.log('✅ DATABASE_URL found');
    
    // Connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    
    try {
      console.log('✅ Database connected successfully');
      
      // Test query - get all users
      const userResult = await client.query('SELECT id, email, first_name, last_name FROM users LIMIT 5');
      
      console.log('✅ Query executed successfully');
      console.log('📊 Found users:', userResult.rows.length);
      
      res.status(200).json({
        message: 'Database connection successful',
        userCount: userResult.rows.length,
        users: userResult.rows.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        }))
      });

    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Database test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 