import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🔍 Environment variables check');
    
    const envVars = {
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        length: process.env.DATABASE_URL?.length || 0,
        preview: process.env.DATABASE_URL?.substring(0, 20) + '...'
      },
      JWT_SECRET: {
        exists: !!process.env.JWT_SECRET,
        length: process.env.JWT_SECRET?.length || 0,
        preview: process.env.JWT_SECRET?.substring(0, 10) + '...'
      },
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV
    };
    
    console.log('📊 Environment variables:', envVars);
    
    res.status(200).json({
      message: 'Environment variables check',
      envVars,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Environment test error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 