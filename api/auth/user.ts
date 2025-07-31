import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if user is authenticated via session
    const session = (req as any).session;
    
    if (!session || !session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get user data from database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    
    try {
      const userResult = await client.query(
        'SELECT id, email, first_name, last_name, profile_image_url, google_id, phone, is_admin FROM users WHERE id = $1',
        [session.userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }

      const user = userResult.rows[0];
      
      res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImageUrl: user.profile_image_url,
        googleId: user.google_id,
        phone: user.phone,
        isAdmin: user.is_admin
      });

    } finally {
      client.release();
      await pool.end();
    }

  } catch (error) {
    console.error('User info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 