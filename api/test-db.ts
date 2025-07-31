import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Create database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const db = drizzle(pool);
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    try {
      // Get all users
      const allUsers = await db.select().from(users);
      console.log(`📊 Found ${allUsers.length} users in database`);
      
      // Get specific user
      const specificUser = await db.select().from(users).where(eq(users.email, 'antip4uck.ia@gmail.com'));
      
      res.status(200).json({
        success: true,
        message: 'Database connection successful',
        userCount: allUsers.length,
        testUser: specificUser.length > 0 ? {
          id: specificUser[0].id,
          email: specificUser[0].email,
          hasPassword: !!specificUser[0].password,
          firstName: specificUser[0].firstName,
          lastName: specificUser[0].lastName
        } : null,
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
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasSessionSecret: !!process.env.SESSION_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    });
  }
} 