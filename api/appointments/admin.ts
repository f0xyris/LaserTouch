import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
}

function verifyToken(token: string): JWTPayload | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

function extractTokenFromRequest(req: any): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
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
    console.log('Appointments admin endpoint called with method:', req.method);
    
    // Verify admin token
    const token = extractTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
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
      if (req.method === 'POST') {
        // Create new appointment as admin
        const { userId, serviceId, appointmentDate, appointmentTime, notes } = req.body;
        
        const result = await client.query(`
          INSERT INTO appointments (user_id, service_id, appointment_date, appointment_time, status, notes, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING id
        `, [
          userId,
          serviceId,
          appointmentDate,
          appointmentTime || null,
          'pending',
          notes || ''
        ]);
        
        res.status(201).json({ id: result.rows[0].id });
      } else {
        // For other methods, redirect to main appointments endpoint
        res.status(405).json({ error: 'Method not implemented in admin endpoint' });
      }
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Appointments admin error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 