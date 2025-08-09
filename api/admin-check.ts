import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, extractTokenFromRequest } from '../shared/jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract token from request
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Check if user is admin
    if (!payload.isAdmin) {
      return res.status(403).json({ message: "Admin privileges required" });
    }

    // Return admin check result
    res.status(200).json({ 
      isAdmin: true,
      userId: payload.userId,
      isDemo: payload.isDemo || false
    });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(401).json({ message: "Authentication failed" });
  }
}