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
      // First, let's check the table structure
      console.log('Checking courses table structure...');
      const structureResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        ORDER BY ordinal_position
      `);
      
      console.log('Courses table columns:', structureResult.rows.map(row => `${row.column_name} (${row.data_type})`));
      
      // Now let's try a simple query to see what columns exist
      console.log('Executing simple courses query...');
      const coursesResult = await client.query(`
        SELECT * FROM courses LIMIT 1
      `);
      
      if (coursesResult.rows.length > 0) {
        console.log('Sample course row:', coursesResult.rows[0]);
      }
      
      // Based on the structure, let's build the proper query
      let query = 'SELECT ';
      const columns = structureResult.rows.map(row => row.column_name);
      
      if (columns.includes('id')) query += 'id, ';
      if (columns.includes('title')) query += 'title, ';
      if (columns.includes('description')) query += 'description, ';
      if (columns.includes('price')) query += 'price, ';
      if (columns.includes('duration')) query += 'duration, ';
      if (columns.includes('image_url')) query += 'image_url, ';
      if (columns.includes('is_active')) query += 'is_active, ';
      if (columns.includes('created_at')) query += 'created_at, ';
      if (columns.includes('updated_at')) query += 'updated_at, ';
      
      // Remove trailing comma and space
      query = query.slice(0, -2);
      query += ' FROM courses';
      
      if (columns.includes('is_active')) {
        query += ' WHERE is_active = true';
      }
      
      if (columns.includes('created_at')) {
        query += ' ORDER BY created_at DESC';
      }
      
      console.log('Final query:', query);
      
      const finalResult = await client.query(query);
      console.log('Courses query result:', finalResult.rows.length, 'courses found');
      
      const courses = finalResult.rows.map(course => ({
        id: course.id,
        title: course.title || 'Untitled Course',
        description: course.description || '',
        price: course.price || 0,
        duration: course.duration || 60,
        imageUrl: course.image_url || null,
        isActive: course.is_active !== false,
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