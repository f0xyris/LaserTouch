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
          <title>LaserTouch - Beauty Salon</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 0; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              max-width: 800px; 
              margin: 20px; 
              background: white; 
              padding: 40px; 
              border-radius: 20px; 
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
            }
            h1 { 
              color: #333; 
              font-size: 2.5rem;
              margin-bottom: 20px;
              background: linear-gradient(45deg, #667eea, #764ba2);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            p { 
              color: #666; 
              line-height: 1.8; 
              font-size: 1.1rem;
              margin-bottom: 20px;
            }
            .features {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin: 30px 0;
            }
            .feature {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              border-left: 4px solid #667eea;
            }
            .feature h3 {
              color: #333;
              margin-bottom: 10px;
            }
            .api-link { 
              background: linear-gradient(45deg, #667eea, #764ba2); 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 25px; 
              display: inline-block; 
              margin-top: 20px;
              font-weight: bold;
              transition: transform 0.3s ease;
            }
            .api-link:hover {
              transform: translateY(-2px);
            }
            .status {
              background: #e8f5e8;
              color: #2d5a2d;
              padding: 10px 20px;
              border-radius: 20px;
              display: inline-block;
              margin: 20px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🌟 LaserTouch Beauty Salon</h1>
            <div class="status">✅ API Server Running</div>
            <p>Welcome to LaserTouch - your premium beauty salon experience!</p>
            
            <div class="features">
              <div class="feature">
                <h3>📅 Appointments</h3>
                <p>Book your beauty treatments online</p>
              </div>
              <div class="feature">
                <h3>🎓 Courses</h3>
                <p>Professional beauty training</p>
              </div>
              <div class="feature">
                <h3>📧 Notifications</h3>
                <p>Email confirmations & updates</p>
              </div>
              <div class="feature">
                <h3>🔐 Security</h3>
                <p>Secure authentication system</p>
              </div>
            </div>
            
            <p>Our API is ready to serve your beauty needs!</p>
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