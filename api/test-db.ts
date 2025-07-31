import { Request, Response } from 'express';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    // Проверяем подключение к базе данных
    const result = await db.execute(sql`SELECT 1 as test`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Database connection successful',
      data: result,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        baseUrl: process.env.BASE_URL
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        baseUrl: process.env.BASE_URL
      }
    });
  }
} 