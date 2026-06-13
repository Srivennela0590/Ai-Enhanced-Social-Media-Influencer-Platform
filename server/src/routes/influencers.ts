import { Router, Request, Response, NextFunction } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import db from '../db/index.js';
import { influencers } from '../db/schema.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

const router = Router();

// Search influencers (with filters, pagination, sorting)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, niche, minFollowers, maxRate, search, page = '1', limit = '20', sort = 'totalFollowers' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let results = await db.select().from(influencers).orderBy(desc(influencers.totalFollowers)).limit(parseInt(limit as string)).offset(offset);

    if (search) results = results.filter(i => i.displayName.toLowerCase().includes((search as string).toLowerCase()) || i.category?.toLowerCase().includes((search as string).toLowerCase()));
    if (category && category !== 'All') results = results.filter(i => i.category === category);
    if (niche) results = results.filter(i => i.niche === niche);
    if (minFollowers) results = results.filter(i => i.totalFollowers >= parseInt(minFollowers as string));
    if (maxRate) results = results.filter(i => parseFloat(String(i.pricePerPost || 0)) <= parseInt(maxRate as string));

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(influencers);

    res.json({
      success: true,
      data: results,
      pagination: { page: parseInt(page as string), limit: parseInt(limit as string), total: countResult[0]?.count || 0 },
    });
  } catch (err) { next(err); }
});

// Get influencer by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.select().from(influencers).where(eq(influencers.id, req.params.id)).limit(1);
    if (!result.length) throw new AppError('Influencer not found', 404);
    res.json({ success: true, data: result[0] });
  } catch (err) { next(err); }
});

// Update influencer profile
router.patch('/profile', authenticate, authorize('influencer'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inf = await db.select().from(influencers).where(eq(influencers.userId, req.user!.sub)).limit(1);
    if (!inf.length) throw new AppError('Profile not found', 404);

    const { displayName, bio, category, niche, location, totalFollowers, engagementRate, pricePerPost, audienceAgeGroup, audienceGender, socialLinks, platforms } = req.body;

    await db.update(influencers).set({
      ...(displayName && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(category && { category }),
      ...(niche && { niche }),
      ...(location && { location }),
      ...(totalFollowers !== undefined && { totalFollowers }),
      ...(engagementRate !== undefined && { engagementRate }),
      ...(pricePerPost !== undefined && { pricePerPost }),
      ...(audienceAgeGroup && { audienceAgeGroup }),
      ...(audienceGender && { audienceGender }),
      ...(socialLinks && { socialLinks }),
      ...(platforms && { platforms }),
    }).where(eq(influencers.id, inf[0].id));

    const updated = await db.select().from(influencers).where(eq(influencers.id, inf[0].id)).limit(1);
    res.json({ success: true, data: updated[0] });
  } catch (err) { next(err); }
});

export default router;
