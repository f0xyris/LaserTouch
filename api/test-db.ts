import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📦 DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_URL not found in environment variables'
      });
    }

    // Create database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('🔌 Pool created, attempting connection...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    try {
      // Simple query to test connection
      const result = await client.query('SELECT COUNT(*) as user_count FROM users');
      console.log('📊 Query result:', result.rows[0]);
      
      // Get specific user
      const userResult = await client.query(
        'SELECT id, email, first_name, last_name, CASE WHEN password IS NOT NULL THEN true ELSE false END as has_password FROM users WHERE email = $1',
        ['antip4uck.ia@gmail.com']
      );
      
      res.status(200).json({
        success: true,
        message: 'Database connection successful',
        userCount: result.rows[0].user_count,
        testUser: userResult.rows.length > 0 ? userResult.rows[0] : null,
        env: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasSessionSecret: !!process.env.SESSION_SECRET,
          nodeEnv: process.env.NODE_ENV
        }
      });
      
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Database test error:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasSessionSecret: !!process.env.SESSION_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    });
  }
} 