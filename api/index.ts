import express from 'express';
const app = express();
app.get('/api/health', (req, res) => {
  res.json({ status: 'minimal-ok', timestamp: new Date().toISOString() });
});
export default app;
