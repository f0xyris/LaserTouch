import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    console.log('🚪 Logout attempt');
    
    // Destroy session
    const session = (req as any).session;
    if (session) {
      session.destroy((err: any) => {
        if (err) {
          console.error('❌ Session destruction error:', err);
          return res.status(500).json({ error: 'Failed to logout' });
        }
        
        console.log('✅ Session destroyed successfully');
        res.status(200).json({ message: 'Logged out successfully' });
      });
    } else {
      console.log('✅ No session to destroy');
      res.status(200).json({ message: 'Logged out successfully' });
    }
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 