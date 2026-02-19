import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z, ZodError } from 'zod';

// Mock DB Layer
const db = {
  prepare: () => ({
    get: () => null,
    run: () => ({ lastInsertRowid: 1, changes: 1 }),
    all: () => []
  })
};

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok-mock',
    db: 'mocked',
    timestamp: new Date().toISOString()
  });
});

// Minimal Register (Mock)
app.post('/api/register', async (req, res, next) => {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    }).parse(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ id: 1, email }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Registration successful (MOCK)',
      user: { id: 1, email }
    });
  } catch (error) {
    next(error);
  }
});

// Minimal Login (Mock)
app.post('/api/login', async (req, res) => {
  res.json({ message: 'Login successful (MOCK)', user: { id: 1, email: req.body.email } });
});

// Error Handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

export default app;
