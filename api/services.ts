import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://laser-touch.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Services endpoint called with method:', req.method);
    
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
      if (req.method === 'GET') {
        console.log('Executing services query...');
        const servicesResult = await client.query(`
          SELECT 
            id, 
            name_ua, 
            name_en, 
            name_ru,
            description_ua, 
            description_en, 
            description_ru,
            price, 
            duration, 
            is_active,
            created_at,
            updated_at
          FROM services 
          WHERE is_active = true 
          ORDER BY created_at DESC
        `);
        
        console.log('Services query result:', servicesResult.rows.length, 'services found');
        
        const services = servicesResult.rows.map(service => ({
          id: service.id,
          name: {
            ua: service.name_ua,
            en: service.name_en,
            ru: service.name_ru
          },
          description: {
            ua: service.description_ua,
            en: service.description_en,
            ru: service.description_ru
          },
          price: service.price,
          duration: service.duration,
          isActive: service.is_active,
          createdAt: service.created_at,
          updatedAt: service.updated_at
        }));
        
        res.status(200).json(services);
      } else if (req.method === 'POST') {
        // Create new service
        const { name, description, price, duration } = req.body;
        
        const result = await client.query(`
          INSERT INTO services (name_ua, name_en, name_ru, description_ua, description_en, description_ru, price, duration, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          RETURNING id
        `, [
          name?.ua || '',
          name?.en || '',
          name?.ru || '',
          description?.ua || '',
          description?.en || '',
          description?.ru || '',
          price || 0,
          duration || 60,
          true
        ]);
        
        res.status(201).json({ id: result.rows[0].id });
      } else if (req.method === 'PUT') {
        // Update service
        const { id, name, description, price, duration } = req.body;
        
        await client.query(`
          UPDATE services 
          SET name_ua = $1, name_en = $2, name_ru = $3, 
              description_ua = $4, description_en = $5, description_ru = $6, 
              price = $7, duration = $8, updated_at = NOW()
          WHERE id = $9
        `, [
          name?.ua || '',
          name?.en || '',
          name?.ru || '',
          description?.ua || '',
          description?.en || '',
          description?.ru || '',
          price || 0,
          duration || 60,
          id
        ]);
        
        res.status(200).json({ success: true });
      } else if (req.method === 'DELETE') {
        // Delete service (soft delete)
        const { id } = req.query;
        
        await client.query(`
          UPDATE services 
          SET is_active = false, updated_at = NOW()
          WHERE id = $1
        `, [id]);
        
        res.status(200).json({ success: true });
      }
      
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Services error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 