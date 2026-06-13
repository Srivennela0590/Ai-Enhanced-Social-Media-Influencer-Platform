import { Router, Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import db from '../db/index.js';
import { users, brands, influencers } from '../db/schema.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

const router = Router();

router.get('/profile', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.select().from(users).where(eq(users.id, req.user!.sub)).limit(1);
    if (!result.length) throw new AppError('User not found', 404);
    const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = result[0];

    let profile = null;
    if (safeUser.role === 'brand') {
      const b = await db.select().from(brands).where(eq(brands.userId, safeUser.id)).limit(1);
      profile = b[0] || null;
    } else {
      const i = await db.select().from(influencers).where(eq(influencers.userId, safeUser.id)).limit(1);
      profile = i[0] || null;
    }

    res.json({ success: true, data: { user: safeUser, profile } });
  } catch (err) { next(err); }
});

router.patch('/profile', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, avatarUrl } = req.body;
    await db.update(users).set({ firstName, lastName, avatarUrl }).where(eq(users.id, req.user!.sub));
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) { next(err); }
});

export default router;
