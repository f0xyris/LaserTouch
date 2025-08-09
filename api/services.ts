import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

type JWTPayload = { userId: number; email: string; isAdmin: boolean; firstName?: string; lastName?: string; isDemo?: boolean };

function extractToken(req: VercelRequest): string | null {
  const auth = req.headers['authorization'];
  if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

function verifyToken(token: string | null): JWTPayload | null {
  if (!token) return null;
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch {
    return null;
  }
}

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
    const payload = verifyToken(extractToken(req));
    const isDemo = !!payload?.isDemo;
    
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
        // First, let's check the table structure
        console.log('Checking services table structure...');
        const structureResult = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'services' 
          ORDER BY ordinal_position
        `);
        
        console.log('Services table columns:', structureResult.rows.map(row => `${row.column_name} (${row.data_type})`));
        
        // Based on the structure, let's build the proper query
        let query = 'SELECT ';
        const columns = structureResult.rows.map(row => row.column_name);
        
        if (columns.includes('id')) query += 'id, ';
        if (columns.includes('name')) query += 'name, ';
        if (columns.includes('description')) query += 'description, ';
        if (columns.includes('price')) query += 'price, ';
        if (columns.includes('duration')) query += 'duration, ';
        if (columns.includes('is_active')) query += 'is_active, ';
        if (columns.includes('created_at')) query += 'created_at, ';
        if (columns.includes('updated_at')) query += 'updated_at, ';
        
        // Remove trailing comma and space
        query = query.slice(0, -2);
        query += ' FROM services';
        
        if (columns.includes('is_active')) {
          query += ' WHERE is_active = true';
        }
        
        if (columns.includes('created_at')) {
          query += ' ORDER BY created_at DESC';
        }
        
        console.log('Final services query:', query);
        
        const servicesResult = await client.query(query);
        console.log('Services query result:', servicesResult.rows.length, 'services found');
        
        const services = servicesResult.rows.map(service => ({
          id: service.id,
          name: service.name || { ua: 'Untitled Service', en: 'Untitled Service', pl: 'Untitled Service' },
          description: service.description || { ua: '', en: '', pl: '' },
          price: service.price || 0,
          duration: service.duration || 60,
          isActive: service.is_active !== false,
          createdAt: service.created_at,
          updatedAt: service.updated_at
        }));
        
        res.status(200).json(services);
      } else if (req.method === 'POST') {
        // Create new service
        const { name, description, price, duration } = req.body;
        if (isDemo) {
          return res.status(201).json({
            id: Math.floor(Math.random() * 1000000) + 1000,
            name: name || { ua: '', en: '', pl: '' },
            description: description || { ua: '', en: '', pl: '' },
            price: price || 0,
            duration: duration || 60,
            isActive: true,
            category: 'custom',
            demo: true,
          });
        }
        
        const result = await client.query(`
          INSERT INTO services (name, description, price, duration, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING id
        `, [
          JSON.stringify(name || { ua: '', en: '', pl: '' }),
          JSON.stringify(description || { ua: '', en: '', pl: '' }),
          price || 0,
          duration || 60,
          true
        ]);
        
        res.status(201).json({ id: result.rows[0].id });
      } else if (req.method === 'PUT') {
        // Update service
        const { id, name, description, price, duration } = req.body;
        if (isDemo) {
          return res.status(200).json({ success: true, demo: true });
        }
        
        await client.query(`
          UPDATE services 
          SET name = $1, description = $2, price = $3, duration = $4, updated_at = NOW()
          WHERE id = $5
        `, [
          JSON.stringify(name || { ua: '', en: '', pl: '' }),
          JSON.stringify(description || { ua: '', en: '', pl: '' }),
          price || 0,
          duration || 60,
          id
        ]);
        
        res.status(200).json({ success: true });
      } else if (req.method === 'DELETE') {
        // Delete service (soft delete)
        const { id } = req.query;
        if (isDemo) {
          return res.status(200).json({ success: true, demo: true });
        }
        
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