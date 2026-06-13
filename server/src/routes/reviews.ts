import { Router, Request, Response, NextFunction } from 'express';
import { eq, and, avg, count } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { reviews, collaborations, brands, influencers } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

const router = Router();

router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.select().from(reviews).where(eq(reviews.revieweeId, req.params.userId));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { collaborationId, revieweeId, rating, comment } = req.body;
    if (rating < 1 || rating > 5) throw new AppError('Rating must be 1-5', 400);

    // Prevent duplicate reviews
    const existing = await db.select().from(reviews)
      .where(and(eq(reviews.collaborationId, collaborationId), eq(reviews.reviewerId, req.user!.sub))).limit(1);
    if (existing.length) throw new AppError('Already reviewed', 409);

    await db.insert(reviews).values({
      id: uuid(), collaborationId, reviewerId: req.user!.sub, revieweeId, rating, comment,
    });

    // Update average rating on the reviewee's profile
    const avgResult = await db.select({
      avgRating: avg(reviews.rating),
      total: count(),
    }).from(reviews).where(eq(reviews.revieweeId, revieweeId));

    if (avgResult[0]) {
      const avgRating = String(avgResult[0].avgRating || 0);
      const total = Number(avgResult[0].total || 0);
      // Update brand or influencer avg rating
      await db.update(brands).set({ avgRating, totalReviews: total }).where(eq(brands.userId, revieweeId));
      await db.update(influencers).set({ avgRating, totalReviews: total }).where(eq(influencers.userId, revieweeId));
    }

    res.status(201).json({ success: true, message: 'Review submitted' });
  } catch (err) { next(err); }
});

export default router;
