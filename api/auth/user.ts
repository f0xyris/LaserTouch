import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('👤 User info request received - DEBUG VERSION');
    
    // Extract token from request
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    console.log('🔍 Token found:', !!token);
    console.log('🔍 Token:', token);
    
    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // For now, accept any test token that starts with 'test-token-'
    if (!token.startsWith('test-token-')) {
      console.log('❌ Invalid token format');
      return res.status(401).json({ message: 'Invalid token' });
    }

    console.log('✅ Test token accepted');

    // Return test user data
    const testUser = {
      id: 1,
      email: 'antip4uck.ia@gmail.com',
      firstName: 'Yaroslav',
      lastName: 'Antypchuk',
      profileImageUrl: null,
      googleId: null,
      phone: '+48 123 456 789',
      isAdmin: true
    };
    
    console.log('📤 Sending test user data:', testUser);
    res.status(200).json(testUser);

  } catch (error) {
    console.error('❌ User info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 