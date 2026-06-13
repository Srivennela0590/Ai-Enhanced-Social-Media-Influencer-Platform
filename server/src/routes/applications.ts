import { Router, Request, Response, NextFunction } from 'express';
import { eq, and } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { applications, influencers, campaigns, collaborations, brands } from '../db/schema.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

const router = Router();

// List applications (filtered by role)
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId, status } = req.query;
    let results;

    if (req.user!.role === 'influencer') {
      const inf = await db.select().from(influencers).where(eq(influencers.userId, req.user!.sub)).limit(1);
      if (!inf.length) throw new AppError('Profile not found', 404);
      results = await db.select().from(applications).where(eq(applications.influencerId, inf[0].id));
    } else {
      // Brand: get apps for their campaigns
      const brand = await db.select().from(brands).where(eq(brands.userId, req.user!.sub)).limit(1);
      if (!brand.length) throw new AppError('Profile not found', 404);
      const brandCampaigns = await db.select().from(campaigns).where(eq(campaigns.brandId, brand[0].id));
      const campaignIds = brandCampaigns.map(c => c.id);
      results = await db.select().from(applications);
      results = results.filter(a => campaignIds.includes(a.campaignId));
    }

    if (campaignId) results = results.filter(a => a.campaignId === campaignId);
    if (status) results = results.filter(a => a.status === status);

    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

// Create application (influencer only)
router.post('/', authenticate, authorize('influencer'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId, proposal, proposedRate } = req.body;
    const inf = await db.select().from(influencers).where(eq(influencers.userId, req.user!.sub)).limit(1);
    if (!inf.length) throw new AppError('Profile not found', 404);

    // Check for duplicate
    const existing = await db.select().from(applications)
      .where(and(eq(applications.campaignId, campaignId), eq(applications.influencerId, inf[0].id))).limit(1);
    if (existing.length) throw new AppError('Already applied to this campaign', 409);

    const campaign = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
    if (!campaign.length) throw new AppError('Campaign not found', 404);

    const id = uuid();
    await db.insert(applications).values({
      id, campaignId, campaignTitle: campaign[0].title,
      influencerId: inf[0].id, influencerName: inf[0].displayName,
      influencerFollowers: inf[0].totalFollowers,
      influencerEngagement: inf[0].engagementRate,
      influencerCategory: inf[0].category,
      status: 'pending', proposal, proposedRate,
    });

    const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
    res.status(201).json({ success: true, data: result[0] });
  } catch (err) { next(err); }
});

// Update application status (brand: accept/reject)
router.patch('/:id/status', authenticate, authorize('brand'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) throw new AppError('Invalid status', 400);

    await db.update(applications).set({ status }).where(eq(applications.id, req.params.id));

    // If accepted, create collaboration
    if (status === 'accepted') {
      const app = await db.select().from(applications).where(eq(applications.id, req.params.id)).limit(1);
      if (app.length) {
        const campaign = await db.select().from(campaigns).where(eq(campaigns.id, app[0].campaignId)).limit(1);
        const brand = await db.select().from(brands).where(eq(brands.userId, req.user!.sub)).limit(1);
        if (campaign.length && brand.length) {
          await db.insert(collaborations).values({
            id: uuid(), campaignId: app[0].campaignId, campaignTitle: campaign[0].title,
            brandId: brand[0].id, brandName: brand[0].companyName,
            influencerId: app[0].influencerId, influencerName: app[0].influencerName,
            status: 'in_progress', agreedRate: app[0].proposedRate,
            deliverables: 'As per campaign requirements',
            startDate: campaign[0].startDate, endDate: campaign[0].endDate,
          });
        }
      }
    }

    res.json({ success: true, message: `Application ${status}` });
  } catch (err) { next(err); }
});

// Withdraw application (influencer)
router.post('/:id/withdraw', authenticate, authorize('influencer'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db.update(applications).set({ status: 'withdrawn' }).where(eq(applications.id, req.params.id));
    res.json({ success: true, message: 'Application withdrawn' });
  } catch (err) { next(err); }
});

export default router;
