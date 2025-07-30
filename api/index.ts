import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../server/uploads')));

// Register API routes
registerRoutes(app);

// Simple fallback for all routes
app.use("*", (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LaserTouch</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; }
            p { color: #666; line-height: 1.6; }
            .api-link { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 LaserTouch API Server</h1>
            <p>Welcome to the LaserTouch API server! This is a backend service that handles:</p>
            <ul>
              <li>Appointment bookings</li>
              <li>Course purchases</li>
              <li>Email notifications</li>
              <li>User authentication</li>
            </ul>
            <p>API endpoints are available at <code>/api/*</code></p>
            <a href="/api/health" class="api-link">Test API Health</a>
          </div>
        </body>
      </html>
    `);
  }
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error('Server error:', err);
  res.status(status).json({ message });
});

export default app; 