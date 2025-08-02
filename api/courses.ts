import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    console.log('Courses endpoint called');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found');
      return res.status(500).json({ error: 'Database configuration missing' });
    }
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const client = await pool.connect();
    console.log('Database connected successfully');
    
    try {
      console.log('Executing courses query...');
      const coursesResult = await client.query(`
        SELECT 
          id, 
          title_ua, 
          title_en, 
          title_ru,
          description_ua, 
          description_en, 
          description_ru,
          price, 
          duration, 
          image_url, 
          is_active,
          created_at,
          updated_at
        FROM courses 
        WHERE is_active = true 
        ORDER BY created_at DESC
      `);
      
      console.log('Courses query result:', coursesResult.rows.length, 'courses found');
      
  
      
      const courses = coursesResult.rows.map(course => ({
        id: course.id,
        title: {
          ua: course.title_ua,
          en: course.title_en,
          ru: course.title_ru
        },
        description: {
          ua: course.description_ua,
          en: course.description_en,
          ru: course.description_ru
        },
        price: course.price,
        duration: course.duration,
        imageUrl: course.image_url,
        isActive: course.is_active,
        createdAt: course.created_at,
        updatedAt: course.updated_at
      }));
      
      res.status(200).json(courses);
      
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Courses fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 