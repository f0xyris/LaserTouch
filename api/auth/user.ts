import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { verifyToken, extractTokenFromRequest } from '../../../shared/jwt';

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
    // Extract token from request (same as local)
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify token (same as local)
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Get fresh user data from database (same as local)
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    
    try {
      const userResult = await client.query(
        'SELECT id, email, first_name, last_name, profile_image_url, google_id, phone, is_admin FROM users WHERE id = $1',
        [payload.userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }

      const user = userResult.rows[0];
      
      const responseData = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImageUrl: user.profile_image_url,
        googleId: user.google_id,
        phone: user.phone,
        isAdmin: user.is_admin
      };
      
      res.status(200).json(responseData);

    } finally {
      client.release();
      await pool.end();
    }

  } catch (error) {
    console.error('❌ User info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 