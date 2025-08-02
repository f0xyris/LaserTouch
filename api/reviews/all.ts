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
    console.log('Reviews endpoint called');
    console.log('Request headers:', req.headers);
    
    // Check if user is admin (optional)
    const token = extractTokenFromRequest(req);
    console.log('Token extracted:', token ? 'Yes' : 'No');
    
    let isAdmin = false;
    if (token) {
      const payload = verifyToken(token);
      console.log('Token payload:', payload);
      isAdmin = payload?.isAdmin || false;
    }
    
    console.log('Is admin:', isAdmin);
    
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
      // First, let's check if reviews table exists
      console.log('Checking if reviews table exists...');
      let reviewsStructure;
      try {
        reviewsStructure = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'reviews' 
          ORDER BY ordinal_position
        `);
        
        console.log('Reviews table columns:', reviewsStructure.rows.map(row => `${row.column_name} (${row.data_type})`));
        
        if (reviewsStructure.rows.length === 0) {
          console.log('Reviews table does not exist, returning empty array');
          return res.status(200).json([]);
        }
      } catch (error) {
        console.log('Error checking reviews table structure:', error.message);
        console.log('Reviews table does not exist, returning empty array');
        return res.status(200).json([]);
      }
      
      // Check what columns exist in reviews table
      const reviewsColumns = reviewsStructure.rows.map(row => row.column_name);
      console.log('Available reviews columns:', reviewsColumns);
      
      console.log('Executing reviews query...');
      let query = `
        SELECT 
          id, 
          rating, 
          comment`;
      
      // Add user_id if it exists, otherwise use name
      if (reviewsColumns.includes('user_id')) {
        query += `, user_id`;
      } else if (reviewsColumns.includes('name')) {
        query += `, name`;
      }
      
      // Add service_id if it exists
      if (reviewsColumns.includes('service_id')) {
        query += `, service_id`;
      }
      
      // Add status column
      if (reviewsColumns.includes('status')) {
        query += `, status`;
      }
      
      // Add created_at and updated_at if they exist
      if (reviewsColumns.includes('created_at')) {
        query += `, created_at`;
      }
      if (reviewsColumns.includes('updated_at')) {
        query += `, updated_at`;
      }
      
      query += `
        FROM reviews 
      `;
      
      // Add WHERE clause for non-admin users (only show approved reviews)
      if (!isAdmin) {
        query += ` WHERE status = 'approved'`;
      }
      
      query += ` ORDER BY id DESC`;
      
      const reviewsResult = await client.query(query);
      
      console.log('Reviews query result:', reviewsResult.rows.length, 'reviews found');
      
      const reviews = reviewsResult.rows.map(review => ({
        id: review.id,
        userId: review.user_id || null,
        userName: review.name || null,
        serviceId: review.service_id || null,
        rating: review.rating,
        comment: review.comment,
        isApproved: review.status === 'approved' || false,
        status: review.status || null,
        createdAt: review.created_at || null,
        updatedAt: review.updated_at || null
      }));
      
      res.status(200).json(reviews);
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Reviews fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 