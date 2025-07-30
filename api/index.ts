import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/vite";
import path from 'path';

// Vercel API handler for production deployment
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware для логирования API запросов
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../server/uploads')));

// Register API routes
registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  try {
    serveStatic(app);
  } catch (error) {
    console.log('Static files not found, serving API only');
    // Fallback for API-only mode
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
            </head>
            <body>
              <h1>LaserTouch API Server</h1>
              <p>This is the API server. The frontend is being built...</p>
              <p>API endpoints are available at /api/*</p>
            </body>
          </html>
        `);
      }
    });
  }
}

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error('Server error:', err);
  res.status(status).json({ message });
});

// Export for Vercel
export default app; 