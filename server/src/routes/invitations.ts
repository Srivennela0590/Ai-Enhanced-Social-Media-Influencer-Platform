import { Router, Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { invitations, brands, influencers, campaigns } from '../db/schema.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import { sendEmail, campaignInviteEmail } from '../lib/email.js';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    let results;
    if (req.user!.role === 'influencer') {
      const inf = await db.select().from(influencers).where(eq(influencers.userId, req.user!.sub)).limit(1);
      results = inf.length ? await db.select().from(invitations).where(eq(invitations.influencerId, inf[0].id)) : [];
    } else {
      const brand = await db.select().from(brands).where(eq(brands.userId, req.user!.sub)).limit(1);
      results = brand.length ? await db.select().from(invitations).where(eq(invitations.brandId, brand[0].id)) : [];
    }
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('brand'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId, influencerId, message } = req.body;
    const brand = await db.select().from(brands).where(eq(brands.userId, req.user!.sub)).limit(1);
    if (!brand.length) throw new AppError('Brand not found', 404);
    const campaign = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
    if (!campaign.length) throw new AppError('Campaign not found', 404);
    const inf = await db.select().from(influencers).where(eq(influencers.id, influencerId)).limit(1);
    if (!inf.length) throw new AppError('Influencer not found', 404);

    const id = uuid();
    await db.insert(invitations).values({
      id, campaignId, campaignTitle: campaign[0].title,
      brandId: brand[0].id, brandName: brand[0].companyName,
      influencerId, influencerName: inf[0].displayName,
      message: message || '', status: 'pending',
    });

    // Send email notification
    const emailContent = campaignInviteEmail(inf[0].displayName, brand[0].companyName, campaign[0].title);
    sendEmail({ to: inf[0].email, ...emailContent }).catch(() => {});

    res.status(201).json({ success: true, message: 'Invitation sent' });
  } catch (err) { next(err); }
});

router.patch('/:id/status', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) throw new AppError('Invalid status', 400);
    await db.update(invitations).set({ status }).where(eq(invitations.id, req.params.id));
    res.json({ success: true, message: `Invitation ${status}` });
  } catch (err) { next(err); }
});

export default router;
