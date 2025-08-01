import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date } = req.query;
    
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: "Date parameter is required" });
    }


    
    // Connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    const client = await pool.connect();
    
    try {
      // Get all appointments and filter by date
      const result = await client.query(`
        SELECT 
          a.id,
          a.appointment_date as "appointmentDate",
          a.status,
          a.notes,
          a.created_at as "createdAt",
          a.client_name as "clientName",
          a.client_phone as "clientPhone",
          a.client_email as "clientEmail",
          a.is_deleted_from_admin as "isDeletedFromAdmin",
          u.id as "userId",
          u.first_name as "firstName",
          u.last_name as "lastName",
          u.email,
          u.phone
        FROM appointments a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.appointment_date DESC
      `);

      // Filter appointments for the specific date
      const dateAppointments = result.rows.filter((appointment: any) => {
        const appointmentDate = new Date(appointment.appointmentDate);
        const queryDate = new Date(date);
        
        // Compare only the date part (year, month, day)
        return appointmentDate.getFullYear() === queryDate.getFullYear() &&
               appointmentDate.getMonth() === queryDate.getMonth() &&
               appointmentDate.getDate() === queryDate.getDate();
      });

  
      res.json(dateAppointments);
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error("Error fetching appointments by date:", error);
    res.status(500).json({ error: "Failed to fetch appointments by date" });
  }
} 