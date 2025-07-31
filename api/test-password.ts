import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🔑 Testing password functionality...');
    
    // Create database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const client = await pool.connect();
    
    try {
      // Get user's password hash
      const userResult = await client.query(
        'SELECT password FROM users WHERE email = $1',
        ['antip4uck.ia@gmail.com']
      );
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const storedHash = userResult.rows[0].password;
      console.log('🗄️ Stored hash:', storedHash);
      
      // Test with a simple password
      const testPassword = 'password123';
      const testHash = await bcrypt.hash(testPassword, 10);
      console.log('🔧 Test hash for "password123":', testHash);
      
      // Test comparison
      const isValidTest = await bcrypt.compare(testPassword, testHash);
      console.log('✅ Test password comparison:', isValidTest);
      
      // Test with empty password
      const emptyPassword = '';
      const isValidEmpty = await bcrypt.compare(emptyPassword, storedHash);
      console.log('🔍 Empty password comparison:', isValidEmpty);
      
      res.status(200).json({
        success: true,
        storedHashLength: storedHash.length,
        storedHashStart: storedHash.substring(0, 20) + '...',
        testHashLength: testHash.length,
        testComparison: isValidTest,
        emptyComparison: isValidEmpty
      });
      
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Password test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 