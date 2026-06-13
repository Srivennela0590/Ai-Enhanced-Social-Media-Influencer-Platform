import { Router, Request, Response, NextFunction } from 'express';
import { eq, desc, like, and, sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import db from '../db/index.js';
import { campaigns, brands } from '../db/schema.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error.js';

const router = Router();

const campaignSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  budget: z.number().positive(),
  targetAudience: z.string().optional(),
  requirements: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).optional(),
  platforms: z.array(z.string()).optional(),
});

// List campaigns (with search, filter, pagination)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, category, search, page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(parseInt(limit as string)).offset(offset);

    // Note: In full Drizzle, you'd chain .where() conditions dynamically
    const results = await query;
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(campaigns);

    res.json({
      success: true,
      data: results,
      pagination: { page: parseInt(page as string), limit: parseInt(limit as string), total: countResult[0]?.count || 0 },
    });
  } catch (err) { next(err); }
});

// Get campaign by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.select().from(campaigns).where(eq(campaigns.id, req.params.id)).limit(1);
    if (!result.length) throw new AppError('Campaign not found', 404);
    res.json({ success: true, data: result[0] });
  } catch (err) { next(err); }
});

// Create campaign (brand only)
router.post('/', authenticate, authorize('brand'), validate(campaignSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await db.select().from(brands).where(eq(brands.userId, req.user!.sub)).limit(1);
    if (!brand.length) throw new AppError('Brand profile not found', 404);

    const id = uuid();
    await db.insert(campaigns).values({
      id,
      brandId: brand[0].id,
      brandName: brand[0].companyName,
      ...req.body,
    });

    const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
    res.status(201).json({ success: true, data: result[0] });
  } catch (err) { next(err); }
});

// Update campaign
router.patch('/:id', authenticate, authorize('brand'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await db.select().from(campaigns).where(eq(campaigns.id, req.params.id)).limit(1);
    if (!campaign.length) throw new AppError('Campaign not found', 404);

    // Verify ownership
    const brand = await db.select().from(brands).where(eq(brands.userId, req.user!.sub)).limit(1);
    if (!brand.length || campaign[0].brandId !== brand[0].id) throw new AppError('Not authorized', 403);

    await db.update(campaigns).set(req.body).where(eq(campaigns.id, req.params.id));
    const result = await db.select().from(campaigns).where(eq(campaigns.id, req.params.id)).limit(1);
    res.json({ success: true, data: result[0] });
  } catch (err) { next(err); }
});

// Delete campaign
router.delete('/:id', authenticate, authorize('brand'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await db.select().from(campaigns).where(eq(campaigns.id, req.params.id)).limit(1);
    if (!campaign.length) throw new AppError('Campaign not found', 404);

    const brand = await db.select().from(brands).where(eq(brands.userId, req.user!.sub)).limit(1);
    if (!brand.length || campaign[0].brandId !== brand[0].id) throw new AppError('Not authorized', 403);

    await db.delete(campaigns).where(eq(campaigns.id, req.params.id));
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) { next(err); }
});

export default router;
