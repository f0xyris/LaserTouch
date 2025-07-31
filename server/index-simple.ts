console.log('🔍 Starting index-simple.ts...');

import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import path from 'path';
import { fileURLToPath } from 'url';

console.log('📦 Imports completed');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createSimpleServer() {
  console.log('🏗️ Creating server...');
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Простое логирование
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Тестовый эндпоинт
  app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'Server is working!',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  // Эндпоинт для проверки переменных окружения
  app.get('/api/env', (req, res) => {
    res.json({
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasSessionSecret: !!process.env.SESSION_SECRET,
      baseUrl: process.env.BASE_URL,
      nodeEnv: process.env.NODE_ENV
    });
  });

  // Обработка ошибок
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  });

  console.log('✅ Server created');
  return app;
}

// Запуск сервера
console.log('🚀 About to start server...');
console.log('📁 Current directory:', process.cwd());
console.log('📄 Script path:', process.argv[1]);

// Упрощенное условие для Windows
if (process.argv[1].includes('index-simple.ts')) {
  console.log('✅ Condition met, starting server...');
  (async () => {
    try {
      console.log('🚀 Starting simple server...');
      console.log('📦 Environment variables:');
      console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
      console.log('  - SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set' : 'Not set');
      console.log('  - BASE_URL:', process.env.BASE_URL || 'Not set');
      console.log('  - NODE_ENV:', process.env.NODE_ENV || 'Not set');
      
      const app = createSimpleServer();
      console.log('✅ Express app created');
      
      const port = parseInt(process.env.PORT || '5000', 10);
      
      app.listen(port, "127.0.0.1", () => {
        console.log(`🚀 Simple server started successfully on port ${port}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📱 Local URL: http://localhost:${port}`);
        console.log(`🧪 Test endpoint: http://localhost:${port}/api/test`);
        console.log(`🔧 Env check: http://localhost:${port}/api/env`);
      });

      // Handle server errors
      app.on('error', (error: any) => {
        console.error('❌ Server error:', error);
        if (error.code === 'EADDRINUSE') {
          console.error(`🚫 Port ${port} is already in use. Please try a different port.`);
        }
      });

      // Handle graceful shutdown
      process.on('SIGTERM', () => {
        console.log('🛑 SIGTERM received, shutting down gracefully');
        process.exit(0);
      });

      process.on('SIGINT', () => {
        console.log('🛑 SIGINT received, shutting down gracefully');
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  })();
} else {
  console.log('❌ Condition not met');
  console.log('import.meta.url:', import.meta.url);
  console.log('process.argv[1]:', process.argv[1]);
} 