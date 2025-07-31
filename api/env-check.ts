import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔧 Environment variables check');
    
    const envVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      SESSION_SECRET: !!process.env.SESSION_SECRET,
      NODE_ENV: process.env.NODE_ENV
    };
    
    console.log('📋 Environment variables status:', envVars);
    
    const missingVars = Object.entries(envVars)
      .filter(([key, value]) => key !== 'NODE_ENV' && !value)
      .map(([key]) => key);
    
    if (missingVars.length > 0) {
      console.log('❌ Missing environment variables:', missingVars);
      res.status(500).json({
        error: 'Missing environment variables',
        missing: missingVars,
        status: envVars
      });
    } else {
      console.log('✅ All environment variables are set');
      res.status(200).json({
        success: true,
        message: 'All environment variables are configured',
        status: envVars
      });
    }
    
  } catch (error) {
    console.error('❌ Environment check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 