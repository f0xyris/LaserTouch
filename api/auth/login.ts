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
    console.log('🔐 Login attempt started - DEBUG VERSION');
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('📧 Login attempt for:', email);
    console.log('🔑 Password provided:', password ? 'YES' : 'NO');

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
    console.log('🔗 DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
    console.log('🔐 JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
    
    // For now, return a simple response to test if the endpoint works
    console.log('🔧 Returning test response for debugging');
    
    const testResponse = {
      token: 'test-token-' + Date.now(),
      user: {
        id: 1,
        email: email,
        firstName: 'Yaroslav',
        lastName: 'Antypchuk',
        isAdmin: true
      }
    };

    console.log('📤 Sending test response:', testResponse);
    res.status(200).json(testResponse);
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 