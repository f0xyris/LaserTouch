import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { verifyToken, extractTokenFromRequest } from '../utils/jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('👤 User info request received');
    
    // Extract token from request
    const token = extractTokenFromRequest(req);
    console.log('🔍 Token found:', !!token);
    
    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      console.log('❌ Invalid token');
      return res.status(401).json({ message: 'Invalid token' });
    }

    console.log('✅ Token verified, user ID:', payload.userId);

    // Get fresh user data from database
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
        console.log('❌ User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }

      const user = userResult.rows[0];
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: user.is_admin
      });
      
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
      
      console.log('📤 Sending user data:', responseData);
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