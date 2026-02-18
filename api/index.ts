import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import 'dotenv/config';
// import { db, dbError } from '../server/db';
const db: any = null;
const dbError: any = null;
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
  /*
  if (!db) {
    return res.status(503).json({
      message: 'Database not initialized',
      error: dbError?.message || 'Unknown DB error'
    });
  }
  */
  next();
};

// --- API Routes ---

// Health Check (Always alive, but reports DB status)
app.get('/api/health', (req, res) => {
  res.json({
    status: db ? 'ok' : 'error',
    dbConnected: !!db,
    dbError: dbError ? {
      message: dbError.message,
      code: dbError.code
    } : null,
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
      message: 'Registration successful',
      user: { id: Number(result.lastInsertRowid), email }
    });
  } catch (error) {
    next(error);
  }
});

// Login
app.post('/api/login', checkDb, async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(1, "Password is required"),
    });

    const { email, password } = schema.parse(req.body);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    next(error);
  }
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

// Get Decisions
app.get('/api/decisions', authenticateToken, checkDb, (req: AuthRequest, res, next) => {
  try {
    const decisions = db.prepare('SELECT * FROM decisions WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.id);
    res.json(decisions);
  } catch (error) {
    next(error);
  }
});

// Create Decision
app.post('/api/decisions', authenticateToken, checkDb, (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      title: z.string().min(1, "Title is required").max(100, "Title is too long"),
      description: z.string().optional(),
      category: z.enum(['Career', 'Health', 'Finance', 'Personal', 'Other']),
    });

    const { title, description, category } = schema.parse(req.body);

    const result = db.prepare(
      'INSERT INTO decisions (user_id, title, description, category) VALUES (?, ?, ?, ?)'
    ).run(req.user!.id, title, description || '', category);

    const newDecision = db.prepare('SELECT * FROM decisions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newDecision);
  } catch (error) {
    next(error);
  }
});

// Update Decision
app.put('/api/decisions/:id', authenticateToken, checkDb, (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      title: z.string().min(1, "Title is required").max(100, "Title is too long").optional(),
      description: z.string().optional(),
      category: z.enum(['Career', 'Health', 'Finance', 'Personal', 'Other']).optional(),
    });

    const data = schema.parse(req.body);

    const existing = db.prepare('SELECT * FROM decisions WHERE id = ? AND user_id = ?').get(id, req.user!.id);
    if (!existing) {
      return res.status(404).json({ message: 'Decision not found' });
    }

    const updates = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length > 0) {
      values.push(id, req.user!.id);
      db.prepare(`UPDATE decisions SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM decisions WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete Decision
app.delete('/api/decisions/:id', authenticateToken, checkDb, (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM decisions WHERE id = ? AND user_id = ?').run(id, req.user!.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Decision not found or unauthorized' });
    }

    res.json({ message: 'Decision deleted successfully' });
  } catch (error) {
    next(error);
  }
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

// --- Dynamic Dev Setup ---
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const setupDev = async () => {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.get('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        const url = req.originalUrl;
        const html = await vite.transformIndexHtml(url, `
          <!DOCTYPE html>
          <html>
            <head><meta charset="UTF-8" /></head>
            <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
          </html>
        `);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    const startPort = process.env.PORT || 3000;
    app.listen(Number(startPort), '0.0.0.0', () => {
      console.log(`Development server running on http://localhost:${startPort}`);
    });
  };
  setupDev().catch(console.error);
}

// Export for Vercel
export default app;
