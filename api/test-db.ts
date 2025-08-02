import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  const allowedOrigins = [
    'https://laser-touch.vercel.app',
    'https://laser-touch-git-main-yaroslav-kravets-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Test DB endpoint called');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found');
      return res.status(500).json({ 
        error: 'Database configuration missing',
        env: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          JWT_SECRET: !!process.env.JWT_SECRET,
          NODE_ENV: process.env.NODE_ENV
        }
      });
    }
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const client = await pool.connect();
    console.log('Database connected successfully');
    
    try {
      // Test basic query
      const result = await client.query('SELECT NOW() as current_time, version() as db_version');
      
      // Test appointments table
      let appointmentsCount = 0;
      try {
        const appointmentsResult = await client.query('SELECT COUNT(*) as count FROM appointments');
        appointmentsCount = parseInt(appointmentsResult.rows[0].count);
      } catch (error) {
        console.log('Appointments table error:', error.message);
      }
      
      // Test users table
      let usersCount = 0;
      try {
        const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
        usersCount = parseInt(usersResult.rows[0].count);
      } catch (error) {
        console.log('Users table error:', error.message);
      }
      
      res.status(200).json({
        success: true,
        database: {
          connected: true,
          currentTime: result.rows[0].current_time,
          version: result.rows[0].db_version,
          appointmentsCount,
          usersCount
        },
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: !!process.env.DATABASE_URL,
          JWT_SECRET: !!process.env.JWT_SECRET
        }
      });
      
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Test DB error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: !!process.env.DATABASE_URL,
        JWT_SECRET: !!process.env.JWT_SECRET
      }
    });
  }
} 