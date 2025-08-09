import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Pool } from 'pg';
import { sendCoursePurchasedEmail } from '../../server/emailService';

// Note: This file runs under @vercel/node runtime, not Next.js API routes.
// We'll manually read the raw body to verify Stripe signatures.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-06-30.basil',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sig = req.headers['stripe-signature'] as string | undefined;
  if (!sig) return res.status(400).send('Missing Stripe signature');

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  let event: Stripe.Event;

  try {
    const rawBody = await (async () => {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk as Buffer);
      }
      return Buffer.concat(chunks);
    })();
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const courseId = paymentIntent.metadata?.courseId;
        const courseNameMeta = paymentIntent.metadata?.courseName;
        const userEmail = paymentIntent.metadata?.userEmail || 'customer@example.com';

        if (courseId) {
          const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
          });
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
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  return res.status(200).json({ received: true });
}
