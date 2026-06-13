import { Router, Request, Response, NextFunction } from 'express';
import { eq, count, sum, avg, sql } from 'drizzle-orm';
import db from '../db/index.js';
import { campaigns, applications, collaborations, payments, brands, influencers } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role === 'brand') {
      const brand = await db.select().from(brands).where(eq(brands.userId, req.user!.sub)).limit(1);
      if (!brand.length) { res.json({ success: true, data: {} }); return; }

      const brandCampaigns = await db.select().from(campaigns).where(eq(campaigns.brandId, brand[0].id));
      const campaignIds = brandCampaigns.map(c => c.id);
      const allApps = (await db.select().from(applications)).filter(a => campaignIds.includes(a.campaignId));
      const allCollabs = await db.select().from(collaborations).where(eq(collaborations.brandId, brand[0].id));
      const allPayments = await db.select().from(payments).where(eq(payments.payerId, req.user!.sub));

      res.json({
        success: true,
        data: {
          totalCampaigns: brandCampaigns.length,
          activeCampaigns: brandCampaigns.filter(c => c.status === 'active').length,
          totalApplications: allApps.length,
          pendingApplications: allApps.filter(a => a.status === 'pending').length,
          totalCollaborations: allCollabs.length,
          activeCollaborations: allCollabs.filter(c => c.status === 'in_progress' || c.status === 'content_review').length,
          totalBudget: brandCampaigns.reduce((s, c) => s + parseFloat(String(c.budget)), 0),
          totalSpent: allPayments.reduce((s, p) => s + parseFloat(String(p.amount)), 0),
          avgRating: brand[0].avgRating,
        },
      });
    } else {
      const inf = await db.select().from(influencers).where(eq(influencers.userId, req.user!.sub)).limit(1);
      if (!inf.length) { res.json({ success: true, data: {} }); return; }

      const myApps = await db.select().from(applications).where(eq(applications.influencerId, inf[0].id));
      const myCollabs = await db.select().from(collaborations).where(eq(collaborations.influencerId, inf[0].id));
      const myPayments = await db.select().from(payments).where(eq(payments.payeeId, req.user!.sub));

      res.json({
        success: true,
        data: {
          totalApplications: myApps.length,
          acceptedApplications: myApps.filter(a => a.status === 'accepted').length,
          totalCollaborations: myCollabs.length,
          completedCollaborations: myCollabs.filter(c => c.status === 'completed').length,
          totalEarnings: myPayments.reduce((s, p) => s + parseFloat(String(p.amount)), 0),
          walletBalance: inf[0].walletBalance,
          avgRating: inf[0].avgRating,
          followers: inf[0].totalFollowers,
          engagementRate: inf[0].engagementRate,
        },
      });
    }
  } catch (err) { next(err); }
});

export default router;
