import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Pool } from 'pg';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-06-30.basil',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const allowedOrigins = [
    'https://laser-touch.vercel.app',
    'https://laser-touch-git-main-yaroslav-kravets-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  const origin = req.headers.origin as string | undefined;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { courseId, userEmail } = req.body as { courseId: number; userEmail?: string };
    if (!courseId) return res.status(400).json({ error: 'courseId required' });

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
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
