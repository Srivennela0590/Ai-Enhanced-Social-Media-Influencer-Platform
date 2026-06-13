// ============================================================
// Auth Routes — Register, Login, Refresh, Forgot/Reset, OAuth
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import db from '../db/index.js';
import { users, brands, influencers } from '../db/schema.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { sendEmail, welcomeEmail, resetPasswordEmail } from '../lib/email.js';
import { AppError } from '../middleware/error.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');

function signTokens(user: { id: string; email: string; role: string }) {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { sub: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
}

// ── REGISTER ─────────────────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['brand', 'influencer']),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  displayName: z.string().optional(),
  niche: z.string().optional(),
  bio: z.string().optional(),
});

router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    // Check if email exists
    const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (existing.length > 0) throw new AppError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const userId = uuid();

    await db.insert(users).values({
      id: userId,
      email: data.email,
      passwordHash,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    // Create role-specific profile
    if (data.role === 'brand') {
      await db.insert(brands).values({
        id: uuid(),
        userId,
        companyName: data.companyName || `${data.firstName}'s Company`,
        industry: data.industry || 'Technology',
        website: data.website || '',
      });
    } else {
      await db.insert(influencers).values({
        id: uuid(),
        userId,
        email: data.email,
        displayName: data.displayName || `${data.firstName} ${data.lastName}`,
        bio: data.bio || '',
        niche: data.niche || 'lifestyle',
        category: data.niche || 'Lifestyle',
      });
    }

    const tokens = signTokens({ id: userId, email: data.email, role: data.role });
    const user = { id: userId, email: data.email, role: data.role, firstName: data.firstName, lastName: data.lastName, isVerified: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    // Send welcome email (non-blocking)
    const emailContent = welcomeEmail(data.firstName);
    sendEmail({ to: data.email, ...emailContent }).catch(() => {});

    res.status(201).json({ success: true, data: { user, ...tokens } });
  } catch (err) { next(err); }
});

// ── LOGIN ────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (result.length === 0) throw new AppError('Invalid email or password', 401);

    const user = result[0];
    if (!user.isActive) throw new AppError('Account is deactivated', 403);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid email or password', 401);

    // Update last login
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    const tokens = signTokens({ id: user.id, email: user.email, role: user.role });
    const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;

    res.json({ success: true, data: { user: safeUser, ...tokens } });
  } catch (err) { next(err); }
});

// ── REFRESH TOKEN ────────────────────────────────────────────
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token required', 400);

    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { sub: string };
    const result = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (result.length === 0) throw new AppError('User not found', 404);

    const user = result[0];
    const tokens = signTokens({ id: user.id, email: user.email, role: user.role });

    res.json({ success: true, data: tokens });
  } catch (err) { next(err); }
});

// ── GET CURRENT USER ─────────────────────────────────────────
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.select().from(users).where(eq(users.id, req.user!.sub)).limit(1);
    if (result.length === 0) throw new AppError('User not found', 404);

    const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = result[0];
    res.json({ success: true, data: { user: safeUser } });
  } catch (err) { next(err); }
});

// ── FORGOT PASSWORD ──────────────────────────────────────────
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

    // Always return success to prevent email enumeration
    if (result.length === 0) { res.json({ success: true, message: 'If the email exists, a reset link has been sent.' }); return; }

    const user = result[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.update(users).set({ resetToken, resetTokenExpiry: expiry }).where(eq(users.id, user.id));

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailContent = resetPasswordEmail(user.firstName, resetUrl);
    await sendEmail({ to: user.email, ...emailContent });

    res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
  } catch (err) { next(err); }
});

// ── RESET PASSWORD ───────────────────────────────────────────
const resetSchema = z.object({ token: z.string(), password: z.string().min(8) });

router.post('/reset-password', validate(resetSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    const result = await db.select().from(users).where(eq(users.resetToken, token)).limit(1);
    if (result.length === 0) throw new AppError('Invalid or expired reset token', 400);

    const user = result[0];
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      throw new AppError('Reset token has expired', 400);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await db.update(users).set({ passwordHash, resetToken: null, resetTokenExpiry: null }).where(eq(users.id, user.id));

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) { next(err); }
});

// ── CHANGE PASSWORD ──────────────────────────────────────────
router.post('/change-password', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) throw new AppError('Invalid input', 400);

    const result = await db.select().from(users).where(eq(users.id, req.user!.sub)).limit(1);
    if (result.length === 0) throw new AppError('User not found', 404);

    const valid = await bcrypt.compare(currentPassword, result[0].passwordHash);
    if (!valid) throw new AppError('Current password is incorrect', 401);

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.update(users).set({ passwordHash }).where(eq(users.id, req.user!.sub));

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
});

export default router;
