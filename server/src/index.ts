// ============================================================
// InfluenceAI — Express Server Entry Point
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { rateLimit } from 'express-rate-limit';
import { logger } from './lib/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { setupSocketIO } from './lib/socket.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import campaignRoutes from './routes/campaigns.js';
import applicationRoutes from './routes/applications.js';
import invitationRoutes from './routes/invitations.js';
import collaborationRoutes from './routes/collaborations.js';
import influencerRoutes from './routes/influencers.js';
import reviewRoutes from './routes/reviews.js';
import paymentRoutes from './routes/payments.js';
import notificationRoutes from './routes/notifications.js';
import messageRoutes from './routes/messages.js';
import analyticsRoutes from './routes/analytics.js';
import mlRoutes from './routes/ml.js';
import aiRoutes from './routes/ai.js';
import uploadRoutes from './routes/uploads.js';
import adminRoutes from './routes/admin.js';

const app = express();
const httpServer = createServer(app);

// ── Socket.IO ────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true },
});
setupSocketIO(io);

// ── Global Middleware ────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(compression());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Stripe Webhook (raw body needed) ─────────────────────────
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/influencers', influencerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── Error Handling ───────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '4000', 10);
httpServer.listen(PORT, () => {
  logger.info(`🚀 InfluenceAI Server running on port ${PORT}`);
  logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API: http://localhost:${PORT}/api`);
  logger.info(`💬 Socket.IO: ws://localhost:${PORT}`);
});

export { app, io };
