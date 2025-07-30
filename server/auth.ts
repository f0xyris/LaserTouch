import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      googleId?: string;
      isAdmin?: boolean;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    store: new session.MemoryStore(),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !user.password) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log("Initializing Google OAuth strategy");
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          // Используем универсальный BASE_URL
          callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            console.log("Google OAuth profile:", profile);
            
            // Check if user exists with Google ID
            let user = await storage.getUserByGoogleId(profile.id);
            
            if (!user) {
              // Check if user exists with email
              const email = profile.emails?.[0]?.value;
              if (email) {
                user = await storage.getUserByEmail(email);
                if (user) {
                  // Update existing user with Google ID
                  user = await storage.updateUser(user.id, { googleId: profile.id });
                }
              }
            }

            if (!user) {
              // Create new user
              const email = profile.emails?.[0]?.value || "";
              user = await storage.createUser({
                email,
                googleId: profile.id,
                firstName: profile.name?.givenName || null,
                lastName: profile.name?.familyName || null,
                profileImageUrl: profile.photos?.[0]?.value || null,
                password: null, // No password for OAuth users
                isAdmin: email === "antip4uck.ia@gmail.com", // Make this email admin by default
              });
            }

            console.log("Google OAuth user created/found:", user);
            return done(null, user);
          } catch (error) {
            console.error("Google OAuth error:", error);
            return done(error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register route
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        googleId: null,
        profileImageUrl: null,
        isAdmin: email === "antip4uck.ia@gmail.com", // Make this email admin by default
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ user: { ...user, password: undefined } });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login route
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: { ...req.user, password: undefined } });
  });

  // Google OAuth routes
  app.get("/api/auth/google", (req, res, next) => {
    console.log("Google OAuth initiated");
    console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
    console.log("Callback URL:", `${process.env.BASE_URL}/api/auth/google/callback`);
    
    // Check if Google OAuth is properly configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error("Google OAuth not configured");
      return res.status(500).json({ error: "Google OAuth not configured" });
    }
    
    try {
      passport.authenticate("google", { 
        scope: ["profile", "email"],
        accessType: "offline",
        prompt: "consent"
      })(req, res, next);
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.status(500).json({ error: "Google OAuth failed" });
    }
  });
  
  app.get("/api/auth/google/callback", 
    (req, res, next) => {
      console.log("Google OAuth callback received");
      passport.authenticate("google", { 
        failureRedirect: "/login?error=oauth_failed",
        successRedirect: "/",
        failureMessage: true
      })(req, res, next);
    }
  );

  // Logout route
  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  // Current user route
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ ...req.user, password: undefined });
  });
}

export const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

export const isAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  
  return next();
};