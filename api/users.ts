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
  isDemo?: boolean;
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
    console.log('Users endpoint called');
    console.log('Request headers:', req.headers);
    
    // Verify admin token
    const token = extractTokenFromRequest(req);
    console.log('Token extracted:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const payload = verifyToken(token);
    console.log('Token payload:', payload);
    
    if (!payload || !payload.isAdmin) {
      console.log('Admin access required, payload:', payload);
      return res.status(403).json({ error: 'Admin access required' });
    }
    const isDemo = payload.isDemo === true;
    
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
      console.log('Executing users query...');
      const usersResult = await client.query(`
        SELECT 
          id, 
          email, 
          first_name, 
          last_name, 
          phone, 
          is_admin, 
          created_at, 
          updated_at
        FROM users 
        ORDER BY created_at DESC
      `);
      
      console.log('Users query result:', usersResult.rows.length, 'users found');
      
      const maskEmail = (email: string) => {
        const [name, domain] = email.split('@');
        if (!name || !domain) return '***@***';
        const visible = Math.min(2, name.length);
        return `${name.slice(0, visible)}***@${domain}`;
      };
      const maskName = (value: string | null) => (value ? `${value[0]}***` : null);

      const users = usersResult.rows.map(user => {
        if (isDemo) {
          return {
            id: user.id,
            email: maskEmail(user.email),
            firstName: maskName(user.first_name),
            lastName: maskName(user.last_name),
            phone: user.phone ? `${String(user.phone).slice(0, 2)}***` : null,
            isAdmin: user.is_admin,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            isMasked: true,
          };
        }
        return {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          isAdmin: user.is_admin,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        };
      });
      
      res.status(200).json(users);
      
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Users fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 