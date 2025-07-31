import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('👑 Checking admin rights...');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    
    try {
      // Check current user
      const userResult = await client.query(
        'SELECT id, email, first_name, last_name, is_admin FROM users WHERE email = $1',
        ['antip4uck.ia@gmail.com']
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];
      console.log('👤 Current user:', {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: user.is_admin
      });

      // If user is not admin, make them admin
      if (!user.is_admin) {
        console.log('🔧 Making user admin...');
        await client.query(
          'UPDATE users SET is_admin = true, updated_at = NOW() WHERE id = $1',
          [user.id]
        );
        
        console.log('✅ User is now admin!');
        
        res.status(200).json({
          success: true,
          message: 'User is now admin',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isAdmin: true
          }
        });
      } else {
        console.log('✅ User is already admin');
        res.status(200).json({
          success: true,
          message: 'User is already admin',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isAdmin: user.is_admin
          }
        });
      }

    } finally {
      client.release();
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Admin check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 