import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import 'dotenv/config';
import { db, dbError } from '../server/db_mock';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../server/middleware';
import { z, ZodError } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

const app = express();

// --- Global Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Helper for DB check
const checkDb = (req: Request, res: Response, next: NextFunction) => {
  if (!db) {
    return res.status(503).json({ 
      message: 'Database not initialized', 
      error: dbError?.message || 'Unknown DB error'
    });
  }
  next();
};

// --- API Routes ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: db ? 'ok' : 'error',
    dbConnected: !!db,
    isMock: true,
    dbError: dbError ? { message: dbError.message } : null,
    environment: process.env.VERCEL ? 'vercel' : 'local',
    timestamp: new Date().toISOString()
  });
});

// Register
app.post('/api/register', checkDb, async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    });

    const { email, password } = schema.parse(req.body);

    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hashedPassword);

    const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Registration successful (MOCK)',
      user: { id: Number(result.lastInsertRowid), email }
    });
  } catch (error) {
    next(error);
  }
});

// Login
app.post('/api/login', checkDb, async (req, res, next) => {
  // Mock login - always succeeds for testing the UI
  res.json({
    message: 'Login successful (MOCK)',
    user: { id: 1, email: req.body.email }
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get Current User
app.get('/api/me', authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Error Handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.issues.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
  }
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

// Export for Vercel
export default app;
