import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://laser-touch.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Health check started');
    
    const healthCheck = {
      timestamp: new Date().toISOString(),
      environment: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        JWT_SECRET: !!process.env.JWT_SECRET,
        NODE_ENV: process.env.NODE_ENV,
      },
      database: {
        connected: false,
        tables: {
          users: false,
          courses: false,
          appointments: false,
        }
      }
    };

    // Test database connection
    if (process.env.DATABASE_URL) {
      try {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
        
        const client = await pool.connect();
        healthCheck.database.connected = true;
        
        // Test tables existence
        try {
          const usersResult = await client.query('SELECT COUNT(*) FROM users');
          healthCheck.database.tables.users = true;
        } catch (error) {
          console.log('Users table not found:', error.message);
        }
        
        try {
          const coursesResult = await client.query('SELECT COUNT(*) FROM courses');
          healthCheck.database.tables.courses = true;
        } catch (error) {
          console.log('Courses table not found:', error.message);
        }
        
        try {
          const appointmentsResult = await client.query('SELECT COUNT(*) FROM appointments');
          healthCheck.database.tables.appointments = true;
        } catch (error) {
          console.log('Appointments table not found:', error.message);
        }
        
        client.release();
        await pool.end();
      } catch (error) {
        console.error('Database connection failed:', error.message);
      }
    }

    res.status(200).json(healthCheck);
    
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 