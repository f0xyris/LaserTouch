import { Request, Response } from 'express';
import { storage } from '../server/storage';

export default async function handler(req: Request, res: Response) {
  try {
    console.log('Test login endpoint called');
    console.log('Request body:', req.body);
    
    // Проверяем подключение к БД
    const users = await storage.getAllUsers();
    console.log('Users in DB:', users.length);
    
    // Проверяем конкретного пользователя
    const testUser = await storage.getUserByEmail('antip4uck.ia@gmail.com');
    console.log('Test user found:', testUser ? 'Yes' : 'No');
    
    res.status(200).json({
      success: true,
      message: 'Login test endpoint working',
      userCount: users.length,
      testUserExists: !!testUser,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        baseUrl: process.env.BASE_URL
      }
    });
  } catch (error) {
    console.error('Login test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        baseUrl: process.env.BASE_URL
      }
    });
  }
} 