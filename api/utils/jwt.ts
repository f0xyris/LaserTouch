import jwt from 'jsonwebtoken';
import type { VercelRequest } from '@vercel/node';

export function generateToken(userId: number): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: number } | null {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
    return decoded;
  } catch (error) {
    console.log('❌ JWT verification failed:', error);
    return null;
  }
}

export function extractTokenFromRequest(req: VercelRequest): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
  }
  
  // Check query parameters
  if (req.query.token && typeof req.query.token === 'string') {
    return req.query.token;
  }
  
  return null;
} 