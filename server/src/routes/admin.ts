import { Router, Request, Response, NextFunction } from 'express';
import { eq, desc, count, sql } from 'drizzle-orm';
import db from '../db/index.js';
import { users, campaigns, collaborations, payments, reviews, brands, influencers } from '../db/schema.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

// Platform statistics
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [brandCount] = await db.select({ count: count() }).from(brands);
    const [influencerCount] = await db.select({ count: count() }).from(influencers);
    const [campaignCount] = await db.select({ count: count() }).from(campaigns);
    const [collabCount] = await db.select({ count: count() }).from(collaborations);
    const [paymentTotal] = await db.select({ total: sql<string>`COALESCE(SUM(amount), 0)` }).from(payments);

    res.json({
      success: true,
      data: {
        totalUsers: userCount.count,
        totalBrands: brandCount.count,
        totalInfluencers: influencerCount.count,
        totalCampaigns: campaignCount.count,
        totalCollaborations: collabCount.count,
        totalRevenue: paymentTotal.total,
      },
    });
  } catch (err) { next(err); }
});

// User management
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const result = await db.select({
      id: users.id, email: users.email, role: users.role,
      firstName: users.firstName, lastName: users.lastName,
      isActive: users.isActive, isVerified: users.isVerified,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt)).limit(parseInt(limit as string)).offset(offset);

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// Deactivate/activate user
router.patch('/users/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.body;
    await db.update(users).set({ isActive }).where(eq(users.id, req.params.id));
    res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}` });
  } catch (err) { next(err); }
});

// Campaign moderation
router.get('/campaigns', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(50);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// Review moderation
router.get('/reviews', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(50);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.patch('/reviews/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isApproved } = req.body;
    await db.update(reviews).set({ isApproved }).where(eq(reviews.id, req.params.id));
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Payment monitoring
router.get('/payments', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.select().from(payments).orderBy(desc(payments.createdAt)).limit(50);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
