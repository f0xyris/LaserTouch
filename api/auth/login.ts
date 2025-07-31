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
    console.log('🔐 Login attempt started - SIMPLIFIED VERSION');
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('📧 Login attempt for:', email);
    console.log('🔑 Password provided:', password ? 'YES' : 'NO');
    
    // Check environment variables
    console.log('🔍 Checking environment variables...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('VERCEL_ENV:', process.env.VERCEL_ENV);

    // For now, return a simple response to test if the endpoint works
    console.log('🔧 Returning simple response for testing');
    
    const testResponse = {
      token: 'test-jwt-token-' + Date.now(),
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