import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

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

      log(logLine);
    }
  });

  next();
});

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  return app;
}

// Start server if this file is run directly
if (process.argv[1].includes('index.ts')) {
  (async () => {
    try {
      console.log('🚀 Starting server...');
      console.log('📦 Environment variables:');
      console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
      console.log('  - SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set' : 'Not set');
      console.log('  - BASE_URL:', process.env.BASE_URL || 'Not set');
      console.log('  - NODE_ENV:', process.env.NODE_ENV || 'Not set');
      
      const app = createServer();
      console.log('✅ Express app created');
      
      const server = await registerRoutes(app);
      console.log('✅ Routes registered');

      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        console.error('Server error:', err);
        res.status(status).json({ message });
      });

      // importantly only setup vite in development and after
      // setting up all the other routes so the catch-all route
      // doesn't interfere with the other routes
      if (app.get("env") === "development") {
        console.log('🔧 Setting up Vite for development...');
        await setupVite(app, server);
        console.log('✅ Vite setup complete');
      } else {
        console.log('📁 Setting up static file serving...');
        serveStatic(app);
        console.log('✅ Static file serving setup complete');
      }

      // ALWAYS serve the app on the port specified in the environment variable PORT
      // Other ports are firewalled. Default to 5000 if not specified.
      // this serves both the API and the client.
      // It is the only port that is not firewalled.
      const port = parseInt(process.env.PORT || '5000', 10);
      
      server.listen(port, "127.0.0.1", () => {
        log(`🚀 Server started successfully on port ${port}`);
        log(`🌍 Environment: ${app.get("env")}`);
        log(`🔌 WebSocket HMR: ${app.get("env") === "development" ? "enabled" : "disabled"}`);
        log(`📱 Local URL: http://localhost:${port}`);
      });

      // Handle server errors
      server.on('error', (error: any) => {
        console.error('❌ Server error:', error);
        if (error.code === 'EADDRINUSE') {
          console.error(`🚫 Port ${port} is already in use. Please try a different port.`);
        }
      });

      // Handle graceful shutdown
      process.on('SIGTERM', () => {
        log('🛑 SIGTERM received, shutting down gracefully');
        server.close(() => {
          log('✅ Server closed');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        log('🛑 SIGINT received, shutting down gracefully');
        server.close(() => {
          log('✅ Server closed');
          process.exit(0);
        });
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  })();
}
