import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { db } from '../server/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../server/middleware';
import { z, ZodError } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    storage: 'json-fallback',
    environment: process.env.VERCEL ? 'vercel' : 'local',
    timestamp: new Date().toISOString()
  });
});

// Register
app.post('/api/register', async (req, res, next) => {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    }).parse(req.body);

    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
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
      user: { id: result.lastInsertRowid, email }
    });
  } catch (error) {
    next(error);
  }
});

// Login
app.post('/api/login', async (req, res, next) => {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string()
    }).parse(req.body);

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
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

// Me
app.get('/api/me', authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Decisions
app.get('/api/decisions', authenticateToken, (req: AuthRequest, res) => {
  const decisions = db.prepare('SELECT * FROM decisions WHERE user_id = ?').all(req.user!.id);
  res.json(decisions);
});

app.post('/api/decisions', authenticateToken, (req: AuthRequest, res, next) => {
  try {
    const { title, description, category } = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.string().min(1)
    }).parse(req.body);

    const result = db.prepare('INSERT INTO decisions (user_id, title, description, category) VALUES (?, ?, ?, ?)').run(
      req.user!.id, title, description || '', category
    );

    const newDecision = db.prepare('SELECT * FROM decisions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newDecision);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/decisions/:id', authenticateToken, (req: AuthRequest, res) => {
  const result = db.prepare('DELETE FROM decisions WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Decision not found' });
  }
  res.json({ message: 'Decision deleted' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', errors: err.issues });
  }
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

export default app;
