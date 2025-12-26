/**
 * APP EXPORT FOR TESTING
 * Separates app from server for supertest
 */
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';

export const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.use('/api/auth', authRouter);

export default app;
