import 'dotenv/config';
import { createServer } from "../server/index";
import { registerRoutes } from "../server/routes";
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any = null;

async function getApp() {
  if (!app) {
    app = createServer();
    await registerRoutes(app);
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const serverApp = await getApp();
    return serverApp(req, res);
  } catch (error) {
    console.error('API handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 