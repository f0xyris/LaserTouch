import 'dotenv/config';
import express from 'express';
import { registerRoutes } from "../server/routes";
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: express.Application | null = null;

async function createApp() {
  if (!app) {
    app = express();
    
    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // CORS headers
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
    
    // Register routes
    await registerRoutes(app);
    
    // Error handling
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('API Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const serverApp = await createApp();
    
    // Convert Vercel request to Express request
    const expressReq = req as any;
    const expressRes = res as any;
    
    // Handle the request
    return serverApp(expressReq, expressRes);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 