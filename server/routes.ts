import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { insertUserSchema, insertAppointmentSchema, insertReviewSchema } from "../shared/schema";
import { z } from "zod";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { sendAppointmentSubmittedEmail, sendAppointmentConfirmedEmail, sendCoursePurchasedEmail } from "./emailService";

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
  app.get("/api/appointments/user", isAuthenticated, async (req: any, res) => {
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
  app.get("/api/appointments", isAdmin, async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  // Get recent appointments (admin only)
  app.get("/api/appointments/recent", isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const appointments = await storage.getRecentAppointments(limit);
      console.log("Sending recent appointments to client:", JSON.stringify(appointments, null, 2));
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching recent appointments:", error);
      res.status(500).json({ error: "Failed to fetch recent appointments" });
    }
  });

  // Create appointment (for authenticated users)
  app.post("/api/appointments", isAuthenticated, async (req: any, res) => {
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
      
      console.log("Creating appointment:", appointmentData);
      
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
        
        console.log("Appointment submission email sent successfully");
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
  app.post("/api/appointments/admin", isAdmin, async (req: any, res) => {
    try {
      const { serviceId, appointmentDate, notes, status, clientInfo } = req.body;
      
      // Admin can create appointments without client name - no validation needed
      
      // Create appointment data for client without account
      // Parse the date properly to avoid timezone issues
      let parsedDate;
      if (appointmentDate) {
        // If it's an ISO string, parse it as UTC to preserve the intended date
        parsedDate = new Date(appointmentDate);
        console.log("Original appointmentDate:", appointmentDate);
        console.log("Parsed date:", parsedDate);
        console.log("Parsed date ISO:", parsedDate.toISOString());
        
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
      
      console.log("Creating admin appointment:", appointmentData);
      
      const appointment = await storage.createAppointmentForClient(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating admin appointment:", error);
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  // Update appointment status (admin only)
    app.put("/api/appointments/:id/status", isAdmin, async (req, res) => {
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
            
            console.log("Appointment confirmation email sent successfully");
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

  app.delete("/api/appointments/:id", isAdmin, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      console.log(`DELETE /api/appointments/${appointmentId} - Starting deletion`);
      
      await storage.deleteAppointment(appointmentId);
      
      console.log(`DELETE /api/appointments/${appointmentId} - Deletion completed`);
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
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(user => ({ ...user, password: undefined }));
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", isAdmin, async (req, res) => {
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
  app.put("/api/users/profile", isAuthenticated, async (req: any, res) => {
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
  app.put("/api/users/:id/admin", isAdmin, async (req, res) => {
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
      console.log("GET /api/services - Fetching all services");
      const services = await storage.getAllServices();
      console.log(`GET /api/services - Found ${services.length} services`);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", async (req, res) => {
    try {
      console.log("GET /api/appointments - Fetching all appointments");
      const appointments = await storage.getAllAppointments();
      console.log(`GET /api/appointments - Found ${appointments.length} appointments:`, appointments.map(a => ({ id: a.id, date: a.appointmentDate, status: a.status })));
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
  app.get("/api/reviews/all", isAdmin, async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all reviews" });
    }
  });

  // Одобрить отзыв (только для админа)
  app.post("/api/reviews/:id/approve", isAdmin, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const review = await storage.approveReview(reviewId);
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve review" });
    }
  });

  // Отклонить отзыв (только для админа)
  app.post("/api/reviews/:id/reject", isAdmin, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const review = await storage.rejectReview(reviewId);
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject review" });
    }
  });

  // Удалить отзыв (только для админа)
  app.delete("/api/reviews/:id", isAdmin, async (req, res) => {
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
      console.log("GET /api/courses - Fetching all courses");
      const courses = await storage.getAllCourses();
      console.log(`GET /api/courses - Found ${courses.length} courses`);
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
  app.put("/api/courses/:id", isAdmin, async (req, res) => {
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
  app.put("/api/services/:id", isAdmin, async (req, res) => {
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
  app.post("/api/services", isAdmin, async (req, res) => {
    try {
      console.log("POST /api/services - Creating new service:", req.body);
      let { name, price, duration, description, category } = req.body;
      if (!name || !price || !duration) {
        console.log("POST /api/services - Missing required fields");
        return res.status(400).json({ error: "Missing required fields" });
      }
      // name и description могут быть строкой (старый фронт) или объектом
      if (typeof name === "string") name = { ua: name };
      if (typeof description === "string") description = { ua: description };
      name = await ensureAllLangs(name, Object.keys(name)[0]);
      description = await ensureAllLangs(description, Object.keys(description)[0]);
      const created = await storage.createService({ name, price, duration, description, category: category || "custom" });
      console.log("POST /api/services - Service created successfully:", created.id);
      res.status(201).json(created);
    } catch (error: any) {
      console.error("CREATE SERVICE ERROR", error);
      res.status(500).json({ error: "Failed to create service", details: typeof error?.message === 'string' ? error.message : String(error) });
    }
  });

  // Удалить услугу (только для админа)
  app.delete("/api/services/:id", isAdmin, async (req, res) => {
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
  app.post("/api/courses", isAdmin, async (req, res) => {
    try {
      console.log("POST /api/courses - Creating new course:", req.body);
      let { name, price, duration, description, category } = req.body;
      if (!name || !price || !duration) {
        console.log("POST /api/courses - Missing required fields");
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (typeof name === "string") name = { ua: name };
      if (typeof description === "string") description = { ua: description };
      name = await ensureAllLangs(name, Object.keys(name)[0]);
      description = await ensureAllLangs(description, Object.keys(description)[0]);
      const created = await storage.createCourse({ name, price, duration, description, category: category || "custom" });
      console.log("POST /api/courses - Course created successfully:", created.id);
      res.status(201).json(created);
    } catch (error: any) {
      console.error("CREATE COURSE ERROR", error);
      res.status(500).json({ error: "Failed to create course", details: typeof error?.message === 'string' ? error.message : String(error) });
    }
  });

  // Удалить курс (только для админа)
  app.delete("/api/courses/:id", isAdmin, async (req, res) => {
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
              
              console.log("Course purchase email sent successfully");
            }
          }
        } catch (emailError) {
          console.error("Error sending course purchase email:", emailError);
          // Don't fail the webhook if email fails
        }
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  // Эндпоинт для загрузки файлов (картинок)
  app.post("/api/upload", isAdmin, upload.single("file"), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Возвращаем относительный путь для фронта
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // Test endpoint for email functionality (admin only)
  app.post("/api/test-email", isAdmin, async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
