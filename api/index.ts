import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z, ZodError } from 'zod';
import fs from 'fs';
import path from 'path';

// --- Integrated JSON Database Logic ---
const isVercel = process.env.VERCEL === '1';
const dataDir = isVercel ? '/tmp' : './data';
if (!fs.existsSync(dataDir)) { fs.mkdirSync(dataDir, { recursive: true }); }
const dbPath = path.join(dataDir, 'db.json');

let localData: { users: any[], decisions: any[] } = { users: [], decisions: [] };
if (fs.existsSync(dbPath)) {
  try { localData = JSON.parse(fs.readFileSync(dbPath, 'utf8')); }
  catch (e) { console.error("DB Load Error", e); }
}

const saveData = () => {
  try { fs.writeFileSync(dbPath, JSON.stringify(localData, null, 2)); }
  catch (e) { console.error("DB Save Error", e); }
};

const db: any = {
  prepare: (query: string) => {
    const q = query.toLowerCase();
    return {
      get: (...args: any[]) => {
        if (q.includes('from users where email = ?')) return localData.users.find(u => u.email === args[0]) || null;
        if (q.includes('from decisions where id = ?')) return localData.decisions.find(d => d.id == args[0]) || null;
        return null;
      },
      all: (...args: any[]) => {
        if (q.includes('from decisions where user_id = ?')) {
          return localData.decisions.filter(d => d.user_id == args[0])
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        return [];
      },
      run: (...args: any[]) => {
        if (q.includes('insert into users')) {
          const user = { id: Date.now(), email: args[0], password: args[1], created_at: new Date().toISOString() };
          localData.users.push(user); saveData();
          return { lastInsertRowid: user.id, changes: 1 };
        }
        if (q.includes('insert into decisions')) {
          const d = { id: Date.now(), user_id: args[0], title: args[1], description: args[2], category: args[3], created_at: new Date().toISOString() };
          localData.decisions.push(d); saveData();
          return { lastInsertRowid: d.id, changes: 1 };
        }
        if (q.includes('delete from decisions')) {
          const initial = localData.decisions.length;
          localData.decisions = localData.decisions.filter(d => !(d.id == args[0] && d.user_id == args[1]));
          saveData();
          return { changes: initial - localData.decisions.length };
        }
        return { changes: 0 };
      }
    };
  }
};

// --- Middleware & Config ---
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const user = jwt.verify(token, JWT_SECRET) as any;
    req.user = user;
    next();
  } catch (err) { return res.status(403).json({ message: 'Invalid or expired token' }); }
};

// --- Routes ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'final-consolidated-ok', timestamp: new Date().toISOString() });
});

app.post('/api/register', async (req, res, next) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body);
    if (db.prepare('SELECT * FROM users WHERE email = ?').get(email)) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hashedPassword);
    const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 86400000 });
    res.status(201).json({ message: 'Registration successful', user: { id: result.lastInsertRowid, email } });
  } catch (error) { next(error); }
});

app.post('/api/login', async (req, res, next) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 86400000 });
    res.json({ message: 'Login successful', user: { id: user.id, email: user.email } });
  } catch (error) { next(error); }
});

app.get('/api/me', authenticateToken, (req, res) => { res.json({ user: req.user }); });

app.get('/api/decisions', authenticateToken, (req: any, res) => {
  res.json(db.prepare('SELECT * FROM decisions WHERE user_id = ?').all(req.user.id));
});

app.post('/api/decisions', authenticateToken, (req: any, res, next) => {
  try {
    const { title, description, category } = z.object({ title: z.string().min(1), description: z.string().optional(), category: z.string().min(1) }).parse(req.body);
    const result = db.prepare('INSERT INTO decisions (user_id, title, description, category) VALUES (?, ?, ?, ?)').run(req.user.id, title, description || '', category);
    res.status(201).json(db.prepare('SELECT * FROM decisions WHERE id = ?').get(result.lastInsertRowid));
  } catch (error) { next(error); }
});

app.delete('/api/decisions/:id', authenticateToken, (req: any, res) => {
  const result = db.prepare('DELETE FROM decisions WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err instanceof ZodError) return res.status(400).json({ message: 'Validation failed', errors: err.issues });
  res.status(err.status || 500).json({ message: err.message || 'Internal error' });
});

export default app;
