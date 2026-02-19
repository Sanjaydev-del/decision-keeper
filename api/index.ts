import express from 'express';
import cors from 'cors';
import { z } from 'zod';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'partial-ok',
    hasZod: !!z,
    timestamp: new Date().toISOString()
  });
});

export default app;
