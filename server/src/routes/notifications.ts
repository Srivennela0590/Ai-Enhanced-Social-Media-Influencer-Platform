import { Router, Request, Response, NextFunction } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import db from '../db/index.js';
import { notifications } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await db.select().from(notifications)
      .where(eq(notifications.userId, req.user!.sub))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    const unreadCount = results.filter(n => !n.isRead).length;
    res.json({ success: true, data: results, unreadCount });
  } catch (err) { next(err); }
});

router.patch('/:id/read', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db.update(notifications).set({ isRead: true })
      .where(and(eq(notifications.id, req.params.id), eq(notifications.userId, req.user!.sub)));
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/read-all', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, req.user!.sub));
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
