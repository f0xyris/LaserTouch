import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { generateToken } from '../../utils/jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🔄 Google OAuth callback received');
    console.log('📝 Query params:', req.query);
    
    // Check environment variables
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('❌ Google OAuth not configured');
      return res.redirect('/login?error=oauth_not_configured');
    }
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not configured');
      return res.redirect('/login?error=database_not_configured');
    }
    
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      return res.redirect('/login?error=jwt_not_configured');
    }
    
    const { code, error } = req.query;
    
    if (error) {
      console.error('❌ Google OAuth error:', error);
      return res.redirect('/login?error=oauth_failed');
    }
    
    if (!code) {
      console.error('❌ No authorization code received');
      return res.redirect('/login?error=no_code');
    }
    
    console.log('🔑 Exchanging code for tokens...');
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: 'https://laser-touch.vercel.app/api/auth/google/callback',
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('❌ Token exchange failed:', tokenData);
      return res.redirect('/login?error=token_exchange_failed');
    }
    
    console.log('✅ Token exchange successful');
    
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    const userInfo = await userInfoResponse.json();
    
    if (!userInfoResponse.ok) {
      console.error('❌ Failed to get user info:', userInfo);
      return res.redirect('/login?error=user_info_failed');
    }
    
    console.log('✅ User info received:', { 
      id: userInfo.id, 
      email: userInfo.email, 
      name: userInfo.name 
    });
    
    // Connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const client = await pool.connect();
    
    try {
      // Check if user exists
      let userResult = await client.query(
        'SELECT id, email, first_name, last_name, google_id, is_admin FROM users WHERE email = $1',
        [userInfo.email]
      );
      
      let user;
      
      if (userResult.rows.length === 0) {
        // Create new user
        console.log('👤 Creating new user from Google OAuth');
        const newUserResult = await client.query(
          `INSERT INTO users (email, first_name, last_name, google_id, is_admin, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
           RETURNING id, email, first_name, last_name, google_id, is_admin`,
          [
            userInfo.email,
            userInfo.given_name || null,
            userInfo.family_name || null,
            userInfo.id,
            userInfo.email === 'antip4uck.ia@gmail.com' // Make this email admin
          ]
        );
        user = newUserResult.rows[0];
      } else {
        // Update existing user with Google ID if needed
        user = userResult.rows[0];
        if (!user.google_id) {
          await client.query(
            'UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2',
            [userInfo.id, user.id]
          );
        }
      }
      
      // Generate JWT token
      const token = generateToken(user.id);
      
      console.log('✅ Google OAuth login successful for:', user.email);
      console.log('🎫 JWT token generated');
      
      // Redirect to home page with token in URL (temporary solution)
      // In production, you'd want to set a cookie or use a more secure method
      res.redirect(`/?token=${encodeURIComponent(token)}`);
      
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    res.redirect('/login?error=oauth_callback_failed');
  }
} 