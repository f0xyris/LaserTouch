import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
}

function verifyToken(token: string): JWTPayload | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

function extractTokenFromRequest(req: any): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // PRODUCTION DEBUGGING: Comprehensive logging for troubleshooting Vercel deployment issues
  console.log('=== APPOINTMENTS API CALLED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Body:', req.body);

  // CORS FIX: Expanded allowed origins to include Vercel preview deployments and local development
  const allowedOrigins = [
    'https://laser-touch.vercel.app',
    'https://laser-touch-git-main-yaroslav-kravets-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request - returning 200');
    return res.status(200).end();
  }
  
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Appointments endpoint called with method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request query:', req.query);
    console.log('Request URL:', req.url);
    
    // Verify token
    const token = extractTokenFromRequest(req);
    console.log('Token extracted:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const payload = verifyToken(token);
    console.log('Token payload:', payload);
    
    if (!payload) {
      console.log('Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }
    
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
      if (req.method === 'GET') {
        console.log('Executing appointments query...');
        
                 // First, let's check if appointments table exists
         console.log('Checking if appointments table exists...');
         let appointmentsStructure;
         try {
           appointmentsStructure = await client.query(`
             SELECT column_name, data_type 
             FROM information_schema.columns 
             WHERE table_name = 'appointments' 
             ORDER BY ordinal_position
           `);
           
           console.log('Appointments table columns:', appointmentsStructure.rows.map(row => `${row.column_name} (${row.data_type})`));
           
           if (appointmentsStructure.rows.length === 0) {
             console.log('Appointments table does not exist, returning empty array');
             return res.status(200).json([]);
           }
         } catch (error) {
           console.log('Error checking appointments table structure:', error.message);
           console.log('Appointments table does not exist, returning empty array');
           return res.status(200).json([]);
         }
        
        // Check if services table exists and has name column
        let servicesNameColumn = null;
        try {
          const servicesStructure = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'services' 
            ORDER BY ordinal_position
          `);
          
          if (servicesStructure.rows.some(row => row.column_name === 'name')) {
            servicesNameColumn = 'name';
          } else if (servicesStructure.rows.some(row => row.column_name === 'name_ua')) {
            servicesNameColumn = 'name_ua';
          }
          console.log('Services table found, name column:', servicesNameColumn);
        } catch (error) {
          console.log('Services table not found, skipping service name');
        }
        
                 // Check what columns exist in appointments table
         const appointmentsColumns = appointmentsStructure.rows.map(row => row.column_name);
         console.log('Available appointments columns:', appointmentsColumns);
         
         let query = `
           SELECT 
             a.id, 
             a.user_id, 
             a.service_id, 
             a.appointment_date`;
         
         
         
         // Add other columns that might exist
         if (appointmentsColumns.includes('status')) {
           query += `, a.status`;
         }
         if (appointmentsColumns.includes('notes')) {
           query += `, a.notes`;
         }
                   if (appointmentsColumns.includes('created_at')) {
            query += `, a.created_at`;
          }
         
         // Add user info if users table exists
         query += `,
             u.first_name as user_first_name,
             u.last_name as user_last_name,
             u.email as user_email
         `;
        
        // Add service name if services table exists
        if (servicesNameColumn) {
          query += `, s.${servicesNameColumn} as service_name`;
        }
        
        query += `
          FROM appointments a
          LEFT JOIN users u ON a.user_id = u.id
        `;
        
        // Add services join if table exists
        if (servicesNameColumn) {
          query += ` LEFT JOIN services s ON a.service_id = s.id`;
        }
        
        console.log('Final query with JOINs:', query);
        
        console.log('Final query:', query);
        
        const queryParams = [];
        
        console.log('User ID from token:', payload.userId);
        console.log('Is admin:', payload.isAdmin);
        
                 // If not admin, only show user's own appointments
         if (!payload.isAdmin) {
           query += ' WHERE a.user_id = $1';
           queryParams.push(payload.userId.toString());
         }
         
         console.log('Query parameters:', queryParams);
        
                           query += ' ORDER BY a.appointment_date DESC';
        
        const appointmentsResult = await client.query(query, queryParams);
        
        console.log('Appointments query result:', appointmentsResult.rows.length, 'appointments found');
        console.log('Raw appointments data:', appointmentsResult.rows);
        
                 const appointments = appointmentsResult.rows.map(appointment => ({
           id: appointment.id,
           userId: appointment.user_id,
           serviceId: appointment.service_id,
           appointmentDate: appointment.appointment_date,
                       appointmentTime: null, // No separate appointment_time column
           status: appointment.status,
                       notes: appointment.notes,
            createdAt: appointment.created_at,
           user: {
             firstName: appointment.user_first_name,
             lastName: appointment.user_last_name,
             email: appointment.user_email
           },
                       service: {
              name: typeof appointment.service_name === 'object' && appointment.service_name?.ua 
                ? appointment.service_name.ua 
                : (typeof appointment.service_name === 'string' 
                  ? appointment.service_name 
                  : (servicesNameColumn ? 'Unknown Service' : 'Service ID: ' + appointment.service_id))
            }
         }));
        
        console.log('GET appointments successful, returning', appointments.length, 'appointments');
        res.status(200).json(appointments);
      } else if (req.method === 'POST') {
        // Create new appointment
        const { userId, serviceId, appointmentDate, appointmentTime, notes } = req.body;
        
        console.log('POST appointment data:', { userId, serviceId, appointmentDate, appointmentTime, notes });
        
        // Validate required fields
        if (!serviceId || !appointmentDate) {
          console.log('Missing required fields:', { serviceId, appointmentDate });
          return res.status(400).json({ error: 'Missing required fields: serviceId and appointmentDate' });
        }
        
        // If admin is creating appointment for another user, use that userId
        // Otherwise, use the current user's ID
        const targetUserId = (payload.isAdmin && userId) ? userId : payload.userId;
        
        // Ensure appointmentDate is in correct format
        let formattedDate = appointmentDate;
        if (typeof appointmentDate === 'string') {
          // If it's already a timestamp string, use it as is
          formattedDate = appointmentDate;
        } else {
          // If it's a Date object or other format, convert to ISO string
          formattedDate = new Date(appointmentDate).toISOString();
        }
        
        console.log('Formatted date:', formattedDate);
        console.log('Target user ID:', targetUserId);
        
                         const result = await client.query(`
          INSERT INTO appointments (user_id, service_id, appointment_date, status, notes, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          RETURNING id
        `, [
          targetUserId.toString(),
          serviceId,
          formattedDate,
          'pending',
          notes || ''
        ]);
        
        console.log('POST appointment successful, created ID:', result.rows[0].id);
        res.status(201).json({ id: result.rows[0].id });
                 } else if (req.method === 'PUT') {
             // CRITICAL FIX: Handle appointment updates from both URL parameters and request body
             // This fixes the issue where frontend sends PUT requests to /api/appointments?id=123
             const { id, status, notes } = req.body;

             // Check if this is a status update request (from URL parameter)
             const urlId = req.query.id;
             const appointmentId = urlId || id;

             if (!appointmentId) {
               return res.status(400).json({ error: 'Appointment ID is required' });
             }
        
        let query = 'UPDATE appointments SET';
        const queryParams = [];
        let paramIndex = 1;
        let hasUpdates = false;
        
        if (status !== undefined) {
          if (hasUpdates) query += ',';
          query += ` status = $${paramIndex++}`;
          queryParams.push(status);
          hasUpdates = true;
        }
        
        if (notes !== undefined) {
          if (hasUpdates) query += ',';
          query += ` notes = $${paramIndex++}`;
          queryParams.push(notes);
          hasUpdates = true;
        }
        
        if (!hasUpdates) {
          return res.status(400).json({ error: 'No fields to update' });
        }
        
        query += ` WHERE id = $${paramIndex}`;
        queryParams.push(appointmentId);
        
        // If not admin, only allow updating own appointments
        if (!payload.isAdmin) {
          query += ` AND user_id = $${paramIndex + 1}`;
          queryParams.push(payload.userId.toString());
        }
        
        const result = await client.query(query, queryParams);
        
        if (result.rowCount === 0) {
          return res.status(404).json({ error: 'Appointment not found or access denied' });
        }
        
                console.log('PUT appointment successful, updated rows:', result.rowCount);
        res.status(200).json({ success: true });
      } else if (req.method === 'DELETE') {
        // Delete appointment
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ error: 'Appointment ID is required' });
        }
        
        let query = 'DELETE FROM appointments WHERE id = $1';
        const queryParams = [id];
        
        // If not admin, only allow deleting own appointments
        if (!payload.isAdmin) {
          query += ' AND user_id = $2';
          queryParams.push(payload.userId.toString());
        }
        
        const result = await client.query(query, queryParams);
        
        if (result.rowCount === 0) {
          return res.status(404).json({ error: 'Appointment not found or access denied' });
        }
        
        console.log('DELETE appointment successful, deleted rows:', result.rowCount);
        res.status(200).json({ success: true });
      }
      
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Appointments error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 