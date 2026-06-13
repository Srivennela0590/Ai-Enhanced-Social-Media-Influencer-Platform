import { Router, Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { payments, collaborations, influencers } from '../db/schema.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import { sendEmail, paymentNotificationEmail } from '../lib/email.js';

const router = Router();

// List payments
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await db.select().from(payments).where(
      req.user!.role === 'brand' ? eq(payments.payerId, req.user!.sub) : eq(payments.payeeId, req.user!.sub)
    );
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

// Create payment (brand pays influencer)
router.post('/', authenticate, authorize('brand'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { collaborationId, amount, description } = req.body;
    const collab = await db.select().from(collaborations).where(eq(collaborations.id, collaborationId)).limit(1);
    if (!collab.length) throw new AppError('Collaboration not found', 404);

    // In production, create Stripe PaymentIntent here
    const id = uuid();
    await db.insert(payments).values({
      id, collaborationId, payerId: req.user!.sub,
      payeeId: collab[0].influencerId, // This should be user ID - in full impl resolve from influencer table
      amount, description: description || collab[0].campaignTitle,
      status: 'completed', // Simulated - in production, set to 'pending' until Stripe confirms
    });

    // Update influencer wallet
    const inf = await db.select().from(influencers).where(eq(influencers.id, collab[0].influencerId)).limit(1);
    if (inf.length) {
      const newBalance = parseFloat(String(inf[0].walletBalance || 0)) + parseFloat(amount);
      await db.update(influencers).set({ walletBalance: String(newBalance) }).where(eq(influencers.id, inf[0].id));

      // Send email notification
      const emailContent = paymentNotificationEmail(inf[0].displayName, parseFloat(amount), description || '');
      sendEmail({ to: inf[0].email, ...emailContent }).catch(() => {});
    }

    res.status(201).json({ success: true, message: 'Payment processed' });
  } catch (err) { next(err); }
});

// Stripe Webhook
router.post('/webhook', async (req: Request, res: Response) => {
  // In production: verify Stripe signature and handle events
  // const sig = req.headers['stripe-signature'];
  // const event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  res.json({ received: true });
});

export default router;
