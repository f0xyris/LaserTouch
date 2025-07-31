import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔐 Login attempt started - v2');
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('📧 Login attempt for:', email);

    // Check environment variables
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found');
      return res.status(500).json({ error: 'Database configuration missing' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not found');
      return res.status(500).json({ error: 'JWT configuration missing' });
    }

    console.log('✅ Environment variables check passed');
    
    // Return a mock successful login response for now
    const mockResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 1,
        email: email,
        firstName: 'Yaroslav',
        lastName: 'Antypchuk',
        isAdmin: false
      }
    };

    console.log('📤 Sending mock login response:', mockResponse);
    res.status(200).json(mockResponse);
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 