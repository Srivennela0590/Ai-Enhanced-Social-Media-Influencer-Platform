import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;
  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, topP: 0.95, maxOutputTokens: 1024 },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch { return null; }
}

const router = Router();

router.post('/caption', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { platform, niche, topic, tone, includeHashtags, includeEmojis } = req.body;
    const prompt = `Generate a ${tone} social media caption for ${platform} about ${topic} in the ${niche} niche. ${includeHashtags ? 'Include 5-8 hashtags.' : ''} ${includeEmojis ? 'Include emojis.' : ''} Write ONLY the caption.`;
    
    const geminiResult = await callGemini(prompt);
    const caption = geminiResult || `Exploring the world of ${topic} in ${niche}! ${includeEmojis ? '✨🚀' : ''}\n\nStay ahead of the curve and embrace what's next.\n\n${includeHashtags ? `#${niche.replace(/\s/g,'')} #${topic.replace(/\s/g,'')} #contentcreator #socialmedia` : ''}`;
    
    res.json({ success: true, data: { caption, source: geminiResult ? 'gemini' : 'template', characterCount: caption.length } });
  } catch (err) { next(err); }
});

router.post('/proposal', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { influencerName, influencerNiche, campaignTitle, campaignDescription, proposedRate } = req.body;
    const prompt = `Write a 150-word campaign proposal from influencer ${influencerName} (${influencerNiche}) for "${campaignTitle}". Rate: $${proposedRate}. Campaign: ${campaignDescription}. Write ONLY the proposal.`;
    
    const geminiResult = await callGemini(prompt);
    const proposal = geminiResult || `I'm excited about "${campaignTitle}" and believe my ${influencerNiche} expertise makes me an ideal partner. With my engaged audience, I can deliver authentic content that resonates. I propose deliverables at $${proposedRate} including feed posts, stories, and video content. Looking forward to collaborating!\n\n— ${influencerName}`;
    
    res.json({ success: true, data: { proposal, source: geminiResult ? 'gemini' : 'template', wordCount: proposal.split(/\s+/).length } });
  } catch (err) { next(err); }
});

router.post('/outreach', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { brandName, influencerName, campaignTitle, campaignGoal, messageType } = req.body;
    const prompt = `Write a ${messageType} outreach message from ${brandName} to influencer ${influencerName} for campaign "${campaignTitle}". Goal: ${campaignGoal}. Format: Subject line first, then message. 100-150 words.`;
    
    const geminiResult = await callGemini(prompt);
    const subject = `Collaboration Opportunity: ${campaignTitle}`;
    const message = geminiResult || `Hi ${influencerName},\n\nWe've been following your incredible work and believe a collaboration on "${campaignTitle}" would be amazing. Our goal is to ${campaignGoal}.\n\nWe'd love to discuss details. Would you be open to a quick call?\n\nBest,\n${brandName} Team`;
    
    res.json({ success: true, data: { subject, message, source: geminiResult ? 'gemini' : 'template', wordCount: message.split(/\s+/).length } });
  } catch (err) { next(err); }
});

export default router;
