import { Request, Response } from 'express';
import { storage } from '../server/storage';

export default async function handler(req: Request, res: Response) {
  try {
    // Проверяем подключение к базе данных через storage
    const users = await storage.getAllUsers();
    
    res.status(200).json({ 
      success: true, 
      message: 'Authentication system working',
      userCount: users.length,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasSessionSecret: !!process.env.SESSION_SECRET,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        baseUrl: process.env.BASE_URL
      }
    });
  } catch (error) {
    console.error('Authentication test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasSessionSecret: !!process.env.SESSION_SECRET,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        baseUrl: process.env.BASE_URL
      }
    });
  }
} 