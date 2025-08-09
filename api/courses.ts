import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { sendCoursePurchasedEmail } from '../server/emailService.js';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-06-30.basil' })
  : null as unknown as Stripe;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const extractToken = (req: VercelRequest): string | null => {
    const auth = req.headers['authorization'];
    if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7);
    return null;
  };
  const verifyToken = (token: string | null): any => {
    if (!token) return null;
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    try { return jwt.verify(token, secret); } catch { return null; }
  };
  const origin = req.headers.origin as string | undefined;
  const url = new URL(req.url || '/', 'https://laser-touch.vercel.app');
  const pathname = url.pathname;

  // Stripe webhook must read raw body and doesn't need CORS
  if (req.method === 'POST' && pathname === '/api/webhook/stripe') {
    const sig = req.headers['stripe-signature'] as string | undefined;
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET || !stripe) {
      return res.status(400).send('Stripe is not configured');
    }
    try {
      const rawBody = await (async () => {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
        }
        return Buffer.concat(chunks);
      })();
      const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const courseId = paymentIntent.metadata?.courseId;
        const courseNameMeta = paymentIntent.metadata?.courseName;
        const userEmail = paymentIntent.metadata?.userEmail || 'customer@example.com';

        if (courseId) {
          const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
          const client = await pool.connect();
          try {
            const courseRes = await client.query('SELECT id, name, price, duration FROM courses WHERE id = $1', [courseId]);
            const course = courseRes.rows?.[0];
            if (course) {
              const courseName = (() => {
                const name = course.name;
                if (typeof name === 'string') return name;
                if (name && typeof name === 'object') return name.ua || name.en || name.pl || name.ru || courseNameMeta || 'Unknown Course';
                return courseNameMeta || 'Unknown Course';
              })();
              const courseDuration = `${course.duration} ${course.duration === 1 ? 'hour' : 'hours'}`;
              const coursePrice = `${(course.price / 100).toLocaleString('ru-RU')} ₽`;
              try {
                await sendCoursePurchasedEmail(userEmail, courseName, courseDuration, coursePrice, 'ua');
              } catch (emailErr) {
                console.error('Error sending course purchase email:', emailErr);
              }
            }
          } finally {
            client.release();
            await pool.end();
          }
        }
      }

      return res.status(200).json({ received: true });
    } catch (err: any) {
      console.error('Webhook error:', err?.message || err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  // Normal CORS for browser endpoints
  const allowedOrigins = [
    'https://laser-touch.vercel.app',
    'https://laser-touch-git-main-yaroslav-kravets-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Create Payment Intent routed to this file
  if (req.method === 'POST' && pathname === '/api/create-payment-intent') {
    if (!stripe) return res.status(500).json({ error: 'Stripe is not configured' });
    try {
      const { courseId, userEmail } = req.body as { courseId: number; userEmail?: string };
      if (!courseId) return res.status(400).json({ error: 'courseId required' });

      const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      const client = await pool.connect();
      try {
        const courseRes = await client.query('SELECT id, name, price, duration FROM courses WHERE id = $1', [courseId]);
        const course = courseRes.rows?.[0];
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const courseName = (() => {
          const name = course.name;
          if (typeof name === 'string') return name;
          if (name && typeof name === 'object') return name.ua || name.en || name.pl || name.ru || 'Unknown Course';
          return 'Unknown Course';
        })();

        const paymentIntent = await stripe.paymentIntents.create({
          amount: course.price,
          currency: 'rub',
          automatic_payment_methods: { enabled: true },
          metadata: {
            courseId: String(courseId),
            courseName,
            userEmail: userEmail || 'customer@example.com',
          },
        });

        return res.status(200).json({ clientSecret: paymentIntent.client_secret, course });
      } finally {
        client.release();
        await pool.end();
      }
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      return res.status(500).json({ error: 'Error creating payment intent: ' + error.message });
    }
  }

  // Create or GET /api/courses
  if (pathname === '/api/courses' && req.method === 'POST') {
    const payload = verifyToken(extractToken(req));
    const isDemo = !!payload?.isDemo;
    if (isDemo) {
      const { name, price, duration, description, category, imageUrl } = req.body as any;
      return res.status(201).json({
        id: Math.floor(Math.random() * 1000000) + 1000,
        name: name || { ua: '', en: '', pl: '' },
        description: description || { ua: '', en: '', pl: '' },
        price: price || 0,
        duration: duration || 60,
        imageUrl: imageUrl || null,
        category: category || 'custom',
        demo: true,
      });
    }
    // For Hobby plan, we avoid implementing write here fully. Return 405.
    return res.status(405).json({ error: 'Method not allowed on serverless in this deployment' });
  }
  if (req.method !== 'GET' || pathname !== '/api/courses') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Courses endpoint called');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found');
      return res.status(500).json({ error: 'Database configuration missing' });
    }
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const client = await pool.connect();
    console.log('Database connected successfully');
    
    try {
      // First, let's check the table structure
      console.log('Checking courses table structure...');
      const structureResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        ORDER BY ordinal_position
      `);
      
      console.log('Courses table columns:', structureResult.rows.map(row => `${row.column_name} (${row.data_type})`));
      
      // Now let's try a simple query to see what columns exist
      console.log('Executing simple courses query...');
      const coursesResult = await client.query(`
        SELECT * FROM courses LIMIT 1
      `);
      
      if (coursesResult.rows.length > 0) {
        console.log('Sample course row:', coursesResult.rows[0]);
      }
      
      // Based on the structure, let's build the proper query
      let query = 'SELECT ';
      const columns = structureResult.rows.map(row => row.column_name);
      
      if (columns.includes('id')) query += 'id, ';
      if (columns.includes('title')) query += 'title, ';
      if (columns.includes('name')) query += 'name, ';
      if (columns.includes('description')) query += 'description, ';
      if (columns.includes('price')) query += 'price, ';
      if (columns.includes('duration')) query += 'duration, ';
      if (columns.includes('image_url')) query += 'image_url, ';
      if (columns.includes('image')) query += 'image, ';
      if (columns.includes('category')) query += 'category, ';
      if (columns.includes('is_active')) query += 'is_active, ';
      if (columns.includes('created_at')) query += 'created_at, ';
      if (columns.includes('updated_at')) query += 'updated_at, ';
      
      // Remove trailing comma and space
      query = query.slice(0, -2);
      query += ' FROM courses';
      
      if (columns.includes('is_active')) {
        query += ' WHERE is_active = true';
      }
      
      if (columns.includes('created_at')) {
        query += ' ORDER BY created_at DESC';
      }
      
      console.log('Final query:', query);
      
      const finalResult = await client.query(query);
      console.log('Courses query result:', finalResult.rows.length, 'courses found');
      
      const courses = finalResult.rows.map(course => ({
        id: course.id,
        name: course.name || course.title || { ua: 'Untitled Course', en: 'Untitled Course', pl: 'Untitled Course' },
        description: course.description || { ua: '', en: '', pl: '' },
        price: course.price || 0,
        duration: course.duration || 60,
        imageUrl: course.image_url || course.image || null,
        category: course.category || 'laser',
        isActive: course.is_active !== false,
        createdAt: course.created_at,
        updatedAt: course.updated_at
      }));
      
      res.status(200).json(courses);
      
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Courses fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 