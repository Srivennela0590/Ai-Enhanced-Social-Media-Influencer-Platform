import { Router, Request, Response, NextFunction } from 'express';
import { eq, or, and, desc, sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { messages } from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get conversations list
router.get('/conversations', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const allMessages = await db.select().from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    // Group by conversation
    const conversations = new Map<string, typeof allMessages[0]>();
    for (const msg of allMessages) {
      if (!conversations.has(msg.conversationId)) {
        conversations.set(msg.conversationId, msg);
      }
    }

    res.json({ success: true, data: Array.from(conversations.values()) });
  } catch (err) { next(err); }
});

// Get messages in a conversation
router.get('/:conversationId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await db.select().from(messages)
      .where(eq(messages.conversationId, req.params.conversationId))
      .orderBy(messages.createdAt)
      .limit(100);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

// Send message
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { receiverId, content, messageType, fileUrl } = req.body;
    const senderId = req.user!.sub;
    const conversationId = [senderId, receiverId].sort().join('-');

    const id = uuid();
    await db.insert(messages).values({
      id, conversationId, senderId, receiverId, content,
      messageType: messageType || 'text', fileUrl,
    });

    const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    res.status(201).json({ success: true, data: result[0] });
  } catch (err) { next(err); }
});

// Mark messages as read
router.post('/:conversationId/read', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db.update(messages).set({ isRead: true, readAt: new Date() })
      .where(and(
        eq(messages.conversationId, req.params.conversationId),
        eq(messages.receiverId, req.user!.sub),
        eq(messages.isRead, false)
      ));
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
