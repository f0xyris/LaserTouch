import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import passport from "passport";
import { insertUserSchema, insertAppointmentSchema, insertReviewSchema } from "../shared/schema";
import { generateToken, verifyToken, extractTokenFromRequest } from "../shared/jwt";
import { z } from "zod";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { sendAppointmentSubmittedEmail, sendAppointmentConfirmedEmail, sendCoursePurchasedEmail, sendAdminAppointmentNotification } from "./emailService";
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

const upload = multer({
  dest: path.join(__dirname, "uploads"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const SUPPORTED_LANGS = ["ua", "en", "ru"];
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY || null;
const YANDEX_TRANSLATE_API_KEY = process.env.YANDEX_TRANSLATE_API_KEY || null;

// JWT Authentication Middleware
const isAuthenticatedJWT = async (req: any, res: any, next: any) => {
  try {
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get fresh user data from database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const client = await pool.connect();
    
    try {
      const userResult = await client.query(
        'SELECT id, email, first_name, last_name, profile_image_url, google_id, phone, is_admin FROM users WHERE id = $1',
        [payload.userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      const user = userResult.rows[0];
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImageUrl: user.profile_image_url,
        googleId: user.google_id,
        phone: user.phone,
        isAdmin: user.is_admin
      };

      next();
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('JWT authentication error:', error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

const isAdminJWT = async (req: any, res: any, next: any) => {
  try {
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!payload.isAdmin) {
      return res.status(403).json({ message: "Admin privileges required" });
    }

    // Get fresh user data from database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const client = await pool.connect();
    
    try {
      const userResult = await client.query(
        'SELECT id, email, first_name, last_name, profile_image_url, google_id, phone, is_admin FROM users WHERE id = $1',
        [payload.userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      const user = userResult.rows[0];
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImageUrl: user.profile_image_url,
        googleId: user.google_id,
        phone: user.phone,
        isAdmin: user.is_admin
      };

      next();
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('JWT admin authentication error:', error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!GOOGLE_TRANSLATE_API_KEY) return text;
  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: from, target: to, format: "text" })
  });
  const data = await res.json() as any;
  return data?.data?.translations?.[0]?.translatedText || text;
}

async function translateTextYandex(text: string, from: string, to: string): Promise<string> {
  if (!YANDEX_TRANSLATE_API_KEY) return text;
  const url = 'https://translate.api.cloud.yandex.net/translate/v2/translate';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Api-Key ${YANDEX_TRANSLATE_API_KEY}`
    },
    body: JSON.stringify({
      sourceLanguageCode: from,
      targetLanguageCode: to,
      texts: [text]
    })
  });
  const data = await res.json() as any;
  return data?.translations?.[0]?.text || text;
}

async function ensureAllLangs(obj: Record<string, string>, fromLang: string): Promise<Record<string, string>> {
  const result: Record<string, string> = { ...obj };
  for (const lang of SUPPORTED_LANGS) {
    if (!result[lang] && result[fromLang]) {
      // Yandex: ua -> uk, en, ru
      let yandexFrom = fromLang === 'ua' ? 'uk' : fromLang;
      let yandexTo = lang === 'ua' ? 'uk' : lang;
      result[lang] = await translateTextYandex(result[fromLang], yandexFrom, yandexTo);
    }
  }
  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Google OAuth routes
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  
  app.get("/api/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req: any, res) => {
      try {
        // User is authenticated via Passport session
        const user = req.user;
        
        if (!user) {
          return res.redirect("/login?error=authentication_failed");
        }

        // Generate JWT token
        const token = generateToken({
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        });

        // Redirect to frontend with token in URL fragment
        const userData = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          googleId: user.googleId,
          phone: user.phone,
          isAdmin: user.isAdmin
        };

        // Encode user data and token for URL
        const encodedData = encodeURIComponent(JSON.stringify({
          token,
          user: userData
        }));

        // Redirect to frontend with authentication data
        res.redirect(`/?auth=${encodedData}`);
        
      } catch (error) {
        res.redirect("/login?error=authentication_failed");
      }
    }
  );

  // Universal JWT Login endpoint (works both locally and on Vercel)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Check environment variables
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'Database configuration missing' });
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'JWT configuration missing' });
      }
      
      // Connect to database (same as Vercel)
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      const client = await pool.connect();
      
      try {
        // Find user by email (same query as Vercel)
        const userResult = await client.query(
          'SELECT id, email, first_name, last_name, password, is_admin FROM users WHERE email = $1',
          [email]
        );

        if (userResult.rows.length === 0) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

                // Verify password using bcrypt (same as Vercel)
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Generate JWT token (same as Vercel)
        
                const token = generateToken({
          userId: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isAdmin: user.is_admin
        });

        const responseData = {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isAdmin: user.is_admin
          }
        };

        res.status(200).json(responseData);

      } finally {
        client.release();
        await pool.end();
      }

    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Universal JWT User info endpoint (works both locally and on Vercel)
  app.get("/api/auth/user", async (req, res) => {
    try {
      // Extract token from request (same as Vercel)
      const token = extractTokenFromRequest(req);
      
      if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Verify token (same as Vercel)
      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Get fresh user data from database (same as Vercel)
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      const client = await pool.connect();
      
      try {
        const userResult = await client.query(
          'SELECT id, email, first_name, last_name, profile_image_url, google_id, phone, is_admin FROM users WHERE id = $1',
          [payload.userId]
        );

        if (userResult.rows.length === 0) {
          return res.status(401).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];
        
        const responseData = {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          profileImageUrl: user.profile_image_url,
          googleId: user.google_id,
          phone: user.phone,
          isAdmin: user.is_admin
        };
        
        res.status(200).json(responseData);

      } finally {
        client.release();
        await pool.end();
      }

    } catch (error) {
      console.error('❌ User info error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Universal JWT Register endpoint (works both locally and on Vercel)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Check environment variables
      if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found');
        return res.status(500).json({ error: 'Database configuration missing' });
      }

      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET not found');
        return res.status(500).json({ error: 'JWT configuration missing' });
      }


      
      // Connect to database (same as Vercel)
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      const client = await pool.connect();
      
      try {
        // Check if user already exists
        const existingUserResult = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [email]
        );

        if (existingUserResult.rows.length > 0) {
          return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create user
        const userResult = await client.query(
          'INSERT INTO users (email, password, first_name, last_name, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, is_admin',
          [email, hashedPassword, firstName || null, lastName || null, email === "antip4uck.ia@gmail.com"]
        );

        const user = userResult.rows[0];

        // Generate JWT token
        const token = generateToken({
          userId: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isAdmin: user.is_admin
        });

        const responseData = {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isAdmin: user.is_admin
          }
        };

        res.status(201).json(responseData);

      } finally {
        client.release();
        await pool.end();
      }

    } catch (error) {
      console.error('❌ Registration error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Universal JWT Logout endpoint (works both locally and on Vercel)
  app.post("/api/auth/logout", (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Legacy logout endpoint for old requests
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      res.redirect("/");
    });
  });

  // Get user appointments
  app.get("/api/appointments/user", isAuthenticatedJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const appointments = await storage.getAppointmentsByUserId(userId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  // Get all appointments (admin only)
  app.get("/api/appointments", isAdminJWT, async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  // Get recent appointments (admin only)
  app.get("/api/appointments/recent", isAdminJWT, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const appointments = await storage.getRecentAppointments(limit);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching recent appointments:", error);
      res.status(500).json({ error: "Failed to fetch recent appointments" });
    }
  });

  // Create appointment (for authenticated users)
  app.post("/api/appointments", isAuthenticatedJWT, async (req: any, res) => {
    try {
      const { serviceId, appointmentDate, notes, status } = req.body;
      
      // Create appointment data with proper field mapping
      const appointmentData = {
        userId: req.user.id,
        serviceId: parseInt(serviceId),
        appointmentDate: new Date(appointmentDate),
        notes: notes || null,
        status: status || "pending"
      };
      
      const appointment = await storage.createAppointment(appointmentData);
      
      // Send email notification for appointment submission
      try {
        // Get service details for email
        const service = await storage.getService(parseInt(serviceId));
        const serviceName = service ? (typeof service.name === 'string' ? service.name : (service.name as any)?.ua || 'Unknown Service') : 'Unknown Service';
        
        // Get user language preference (default to 'ua')
        const userLanguage = 'ua'; // Default language since user.language field doesn't exist yet
        
        await sendAppointmentSubmittedEmail(
          req.user.email,
          serviceName,
          new Date(appointmentDate),
          userLanguage
        );
        

        
        // Send admin notification email
        try {
          const adminEmail = process.env.ADMIN_EMAIL || 'antip4uck.ia@gmail.com';
          const clientName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Unknown Client';
          const clientPhone = req.user.phone || 'No phone provided';
          
          await sendAdminAppointmentNotification(
            adminEmail,
            clientName,
            req.user.email,
            clientPhone,
            serviceName,
            new Date(appointmentDate),
            userLanguage
          );
          

        } catch (adminEmailError) {
          console.error("Error sending admin notification email:", adminEmailError);
          // Don't fail the appointment creation if admin email fails
        }
      } catch (emailError) {
        console.error("Error sending appointment submission email:", emailError);
        // Don't fail the appointment creation if email fails
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  // Create appointment for client without account (admin only)
  app.post("/api/appointments/admin", isAdminJWT, async (req: any, res) => {
    try {
      const { serviceId, appointmentDate, notes, status, clientInfo } = req.body;
      
      // Admin can create appointments without client name - no validation needed
      
      // Create appointment data for client without account
      // Parse the date properly to avoid timezone issues
      let parsedDate;
      if (appointmentDate) {
        // If it's an ISO string, parse it as UTC to preserve the intended date
        parsedDate = new Date(appointmentDate);

        
        // Validate the parsed date
        if (isNaN(parsedDate.getTime())) {
          console.error("Invalid date received:", appointmentDate);
          return res.status(400).json({ error: "Invalid date format" });
        }
      } else {
        parsedDate = new Date();
      }
      
      const appointmentData = {
        serviceId: parseInt(serviceId),
        appointmentDate: parsedDate,
        notes: notes || null,
        status: status || "confirmed", // Admin creates confirmed appointments
        clientInfo: {
          name: clientInfo?.name || "Client without name",
          phone: clientInfo?.phone || null,
          email: clientInfo?.email || null
        }
      };
      

      
      const appointment = await storage.createAppointmentForClient(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating admin appointment:", error);
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  // Update appointment status (admin only)
    app.put("/api/appointments/:id/status", isAdminJWT, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;

      if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const appointment = await storage.updateAppointmentStatus(appointmentId, status);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Send email notification when appointment is confirmed
      if (status === "confirmed" && appointment.userId) {
        try {
          // Get user details
          const user = await storage.getUser(appointment.userId);
          if (user && user.email) {
            // Get service details
            const service = await storage.getService(appointment.serviceId);
            const serviceName = service ? (typeof service.name === 'string' ? service.name : (service.name as any)?.ua || 'Unknown Service') : 'Unknown Service';
            
            // Get user language preference (default to 'ua')
            const userLanguage = 'ua'; // Default language since user.language field doesn't exist yet
            
            await sendAppointmentConfirmedEmail(
              user.email,
              serviceName,
              new Date(appointment.appointmentDate),
              userLanguage
            );
            
    
          }
        } catch (emailError) {
          console.error("Error sending appointment confirmation email:", emailError);
          // Don't fail the status update if email fails
        }
      }

      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ error: "Failed to update appointment status" });
    }
  });

  app.delete("/api/appointments/:id", isAdminJWT, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      await storage.deleteAppointment(appointmentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  // Check appointment availability
  app.post("/api/appointments/check-availability", async (req, res) => {
    try {
      const { serviceId, appointmentDate } = req.body;
      
      if (!serviceId || !appointmentDate) {
        return res.status(400).json({ error: "Service ID and appointment date are required" });
      }
      
      // Get service to check duration
      const service = await storage.getService(parseInt(serviceId));
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      
      const startDate = new Date(appointmentDate);
      const endDate = new Date(startDate.getTime() + service.duration * 60 * 1000);
      
      // Check for conflicting appointments
      const conflicts = await storage.getConflictingAppointments(startDate, endDate);
      
      res.json({
        available: conflicts.length === 0,
        conflicts: conflicts
      });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ error: "Failed to check availability" });
    }
  });

  // Users routes (admin only)
  app.get("/api/users", isAdminJWT, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(user => ({ ...user, password: undefined }));
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", isAdminJWT, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json({ ...user, password: undefined });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  });

  // Update user profile (authenticated user)
  app.put("/api/users/profile", isAuthenticatedJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, phone, profileImageUrl } = req.body;
      
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phone !== undefined) updateData.phone = phone;
      if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
      
      const user = await storage.updateUser(userId, updateData);
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Update user admin status (admin only)
  app.put("/api/users/:id/admin", isAdminJWT, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isAdmin } = req.body;
      
      if (typeof isAdmin !== 'boolean') {
        return res.status(400).json({ error: "isAdmin must be a boolean" });
      }
      
      const user = await storage.updateUserAdminStatus(userId, isAdmin);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user admin status" });
    }
  });

  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
          const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", async (req, res) => {
    try {
          const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create appointment" });
      }
    }
  });

  // Get appointments by date for booking page
  app.get("/api/appointments/by-date", async (req, res) => {
    try {
      const { date } = req.query;
      
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: "Date parameter is required" });
      }

      // Get all appointments and filter by date
      const allAppointments = await storage.getAllAppointments();
      
      // Filter appointments for the specific date
      const dateAppointments = allAppointments.filter((appointment: any) => {
        const appointmentDate = new Date(appointment.appointmentDate);
        const queryDate = new Date(date);
        
        // Compare only the date part (year, month, day)
        return appointmentDate.getFullYear() === queryDate.getFullYear() &&
               appointmentDate.getMonth() === queryDate.getMonth() &&
               appointmentDate.getDate() === queryDate.getDate();
      });
      res.json(dateAppointments);
    } catch (error) {
      console.error("Error fetching appointments by date:", error);
      res.status(500).json({ error: "Failed to fetch appointments by date" });
    }
  });

  // Reviews routes
  // Получить только одобренные отзывы
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByStatus("approved");
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Получить все отзывы (только для админа)
  app.get("/api/reviews/all", isAdminJWT, async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all reviews" });
    }
  });

  // Одобрить отзыв (только для админа)
  app.post("/api/reviews/:id/approve", isAdminJWT, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const review = await storage.approveReview(reviewId);
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve review" });
    }
  });

  // Отклонить отзыв (только для админа)
  app.post("/api/reviews/:id/reject", isAdminJWT, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const review = await storage.rejectReview(reviewId);
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject review" });
    }
  });

  // Удалить отзыв (только для админа)
  app.delete("/api/reviews/:id", isAdminJWT, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      await storage.deleteReview(reviewId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      // Только нужные поля, статус всегда pending
      const { name, rating, comment, userId } = req.body;
      const reviewData = insertReviewSchema.parse({
        name,
        rating,
        comment,
        userId: userId || null,
        serviceId: null,
        status: "pending"
      });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create review" });
      }
    }
  });

  // Courses routes
  app.get("/api/courses", async (req, res) => {
    try {
          const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourseById(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch course" });
    }
  });

  // Обновить курс (только для админа)
  app.put("/api/courses/:id", isAdminJWT, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { price, duration, name, description } = req.body;
      const updateData: any = { price, duration };
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      const updated = await storage.updateCourse(id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update course" });
    }
  });

  // Обновить услугу (только для админа)
  app.put("/api/services/:id", isAdminJWT, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { price, duration, name, description } = req.body;
      const updateData: any = { price, duration };
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      const updated = await storage.updateService(id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  // Добавить услугу (только для админа)
  app.post("/api/services", isAdminJWT, async (req, res) => {
    try {
      let { name, price, duration, description, category } = req.body;
      if (!name || !price || !duration) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      // name и description могут быть строкой (старый фронт) или объектом
      if (typeof name === "string") name = { ua: name };
      if (typeof description === "string") description = { ua: description };
      name = await ensureAllLangs(name, Object.keys(name)[0]);
      description = await ensureAllLangs(description, Object.keys(description)[0]);
      const created = await storage.createService({ name, price, duration, description, category: category || "custom" });
      res.status(201).json(created);
    } catch (error: any) {
      console.error("CREATE SERVICE ERROR", error);
      res.status(500).json({ error: "Failed to create service", details: typeof error?.message === 'string' ? error.message : String(error) });
    }
  });

  // Удалить услугу (только для админа)
  app.delete("/api/services/:id", isAdminJWT, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteService(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("DELETE SERVICE ERROR", error);
      res.status(500).json({ 
        error: "Failed to delete service", 
        details: typeof error?.message === 'string' ? error.message : String(error) 
      });
    }
  });

  // Добавить курс (только для админа)
  app.post("/api/courses", isAdminJWT, async (req, res) => {
    try {
      let { name, price, duration, description, category } = req.body;
      if (!name || !price || !duration) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (typeof name === "string") name = { ua: name };
      if (typeof description === "string") description = { ua: description };
      name = await ensureAllLangs(name, Object.keys(name)[0]);
      description = await ensureAllLangs(description, Object.keys(description)[0]);
      const created = await storage.createCourse({ name, price, duration, description, category: category || "custom" });
      res.status(201).json(created);
    } catch (error: any) {
      console.error("CREATE COURSE ERROR", error);
      res.status(500).json({ error: "Failed to create course", details: typeof error?.message === 'string' ? error.message : String(error) });
    }
  });

  // Удалить курс (только для админа)
  app.delete("/api/courses/:id", isAdminJWT, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteCourse(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  // Stripe payment route for course purchases
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { courseId, userEmail } = req.body;
      
      // Get course details
      const course = await storage.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: course.price, // Price is already in kopecks
        currency: "rub",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          courseId: courseId.toString(),
          courseName: (() => {
            if (typeof course.name === 'string') return course.name;
            if (typeof course.name === 'object' && course.name !== null) {
              const nameObj = course.name as Record<string, string>;
              return nameObj.ua || nameObj.en || nameObj.pl || nameObj.ru || 'Unknown Course';
            }
            return 'Unknown Course';
          })(),
          userEmail: userEmail || 'customer@example.com'
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        course: course
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        error: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Stripe webhook for payment confirmation
  app.post("/api/webhook/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret as string);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Send email notification for successful course purchase
        try {
          const courseId = paymentIntent.metadata?.courseId;
          const courseName = paymentIntent.metadata?.courseName;
          
          if (courseId && courseName) {
            const course = await storage.getCourseById(parseInt(courseId));
            if (course) {
              // Get course details for email
              const courseNameForEmail = typeof course.name === 'string' ? course.name : (course.name as any)?.ua || courseName;
              const courseDuration = `${course.duration} ${course.duration === 1 ? 'hour' : 'hours'}`;
              const coursePrice = `${(course.price / 100).toLocaleString('ru-RU')} ₽`;
              
              // Get user email from payment intent metadata
              const userEmail = paymentIntent.metadata?.userEmail || 'customer@example.com';
              const userLanguage = 'ua'; // Default language
              
              await sendCoursePurchasedEmail(
                userEmail,
                courseNameForEmail,
                courseDuration,
                coursePrice,
                userLanguage
              );
              
      
            }
          }
        } catch (emailError) {
          console.error("Error sending course purchase email:", emailError);
          // Don't fail the webhook if email fails
        }
        break;
        
      default:

    }

    res.json({ received: true });
  });

  // Эндпоинт для загрузки файлов (картинок)
  app.post("/api/upload", isAdminJWT, upload.single("file"), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Возвращаем относительный путь для фронта
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // Test endpoint for email functionality (admin only)
  app.post("/api/test-email", isAdminJWT, async (req, res) => {
    try {
      const { email, type, language = 'ua' } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      switch (type) {
        case 'appointment-submitted':
          await sendAppointmentSubmittedEmail(
            email,
            'Test Service',
            new Date(),
            language
          );
          break;
        case 'appointment-confirmed':
          await sendAppointmentConfirmedEmail(
            email,
            'Test Service',
            new Date(),
            language
          );
          break;
        case 'course-purchased':
          await sendCoursePurchasedEmail(
            email,
            'Test Course',
            '2 hours',
            '5000 ₽',
            language
          );
          break;
        default:
          return res.status(400).json({ error: "Invalid email type" });
      }

      res.json({ success: true, message: "Test email sent successfully" });
    } catch (error: any) {
      console.error("Error sending test email:", error);
      res.status(500).json({ error: "Failed to send test email", details: error.message });
    }
  });

  // Simple test endpoint for email (no auth required for quick testing)
  app.post("/api/test-email-simple", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Import email service functions
      const { sendAppointmentSubmittedEmail } = await import("./emailService.js");
      
      await sendAppointmentSubmittedEmail(
        email,
        'Test Service',
        new Date(),
        'ua'
      );

      res.json({ success: true, message: "Test email sent successfully" });
    } catch (error: any) {
      console.error("Error sending test email:", error);
      res.status(500).json({ error: "Failed to send test email", details: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
