import { Router, Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import db from '../db/index.js';
import { collaborations, brands, influencers } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    let results;
    if (req.user!.role === 'brand') {
      const brand = await db.select().from(brands).where(eq(brands.userId, req.user!.sub)).limit(1);
      results = brand.length ? await db.select().from(collaborations).where(eq(collaborations.brandId, brand[0].id)) : [];
    } else {
      const inf = await db.select().from(influencers).where(eq(influencers.userId, req.user!.sub)).limit(1);
      results = inf.length ? await db.select().from(collaborations).where(eq(collaborations.influencerId, inf[0].id)) : [];
    }
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

router.patch('/:id/status', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const validStatuses = ['negotiation', 'in_progress', 'content_review', 'completed', 'disputed'];
    if (!validStatuses.includes(status)) throw new AppError('Invalid status', 400);
    await db.update(collaborations).set({ status }).where(eq(collaborations.id, req.params.id));
    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err) { next(err); }
});

export default router;
