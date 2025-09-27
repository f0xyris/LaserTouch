import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { verifyToken, extractTokenFromRequest } from '../shared/jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://laser-touch.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = extractTokenFromRequest(req as any);
    const payload = token ? verifyToken(token) : null;
    if (!payload || !payload.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.query;
    const { isAdmin } = req.body as { isAdmin?: boolean };

    const userId = Array.isArray(id) ? id[0] : id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required in path' });
    }
    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ error: 'isAdmin must be a boolean' });
    }

    // Demo mode: short-circuit
    if (payload.isDemo) {
      return res.status(200).json({ id: Number(userId), isAdmin });
    }

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database configuration missing' });
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE users SET is_admin = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, first_name, last_name, phone, is_admin, created_at, updated_at',
        [isAdmin, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const u = result.rows[0];
      return res.status(200).json({
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        phone: u.phone,
        isAdmin: u.is_admin,
        createdAt: u.created_at,
        updatedAt: u.updated_at
      });
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('❌ Users admin update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


