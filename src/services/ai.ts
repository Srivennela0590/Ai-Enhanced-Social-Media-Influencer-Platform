// ============================================================
// AI Content Generation Service
// Google Gemini API + Intelligent Template Fallback
// ============================================================
//
// APIs:
//   POST /api/ai/caption   — Social media caption generation
//   POST /api/ai/proposal  — Campaign proposal generation
//   POST /api/ai/outreach  — Influencer outreach message generation
//
// Environment Variable: GEMINI_API_KEY
// If unavailable, uses intelligent template-based generation.
// ============================================================

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;
  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        },
      }),
    });
    if (!res.ok) return null;
    const data: GeminiResponse = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

// ============================================================
// CAPTION GENERATION — POST /api/ai/caption
// ============================================================

export interface CaptionInput {
  platform: string;
  niche: string;
  topic: string;
  tone: string;
  includeHashtags: boolean;
  includeEmojis: boolean;
  maxLength?: number;
}

export interface CaptionOutput {
  caption: string;
  hashtags: string[];
  characterCount: number;
  source: 'gemini' | 'template';
}

export async function generateCaption(input: CaptionInput): Promise<CaptionOutput> {
  const prompt = `Generate a social media caption for ${input.platform}.
Niche: ${input.niche}
Topic: ${input.topic}
Tone: ${input.tone}
${input.includeHashtags ? 'Include 5-8 relevant hashtags at the end.' : 'Do NOT include hashtags.'}
${input.includeEmojis ? 'Include relevant emojis naturally in the text.' : 'Do NOT use emojis.'}
${input.maxLength ? `Keep it under ${input.maxLength} characters.` : ''}
Write ONLY the caption text, nothing else. No quotes around it.`;

  const geminiResult = await callGemini(prompt);
  if (geminiResult) {
    const hashtagMatch = geminiResult.match(/#\w+/g) || [];
    return {
      caption: geminiResult,
      hashtags: hashtagMatch,
      characterCount: geminiResult.length,
      source: 'gemini',
    };
  }

  return templateCaption(input);
}

function templateCaption(input: CaptionInput): CaptionOutput {
  const { platform, niche, topic, tone, includeHashtags, includeEmojis } = input;
  const e = includeEmojis;

  const hooks: Record<string, string[]> = {
    professional: [
      `Here's what most people get wrong about ${topic}`,
      `The industry is changing. Here's how ${topic} fits in`,
      `After years in ${niche}, here's my take on ${topic}`,
    ],
    casual: [
      `${e ? '👋 ' : ''}Let's talk about ${topic}`,
      `${e ? '💡 ' : ''}Hot take: ${topic} is a game-changer`,
      `${e ? '🔥 ' : ''}POV: You just discovered ${topic}`,
    ],
    humorous: [
      `${e ? '😂 ' : ''}Nobody: ... Me: obsessing over ${topic}`,
      `${e ? '💀 ' : ''}When someone says ${topic} doesn't matter`,
      `${e ? '🤣 ' : ''}Tell me you love ${niche} without telling me you love ${niche}`,
    ],
    inspirational: [
      `${e ? '✨ ' : ''}Your journey in ${niche} starts with one step`,
      `${e ? '🌟 ' : ''}Dream big. ${topic} is just the beginning`,
      `${e ? '💪 ' : ''}Success in ${niche} isn't luck — it's ${topic}`,
    ],
    educational: [
      `${e ? '📚 ' : ''}${topic} 101: Everything you need to know`,
      `${e ? '🧠 ' : ''}3 things I wish I knew about ${topic} sooner`,
      `${e ? '💡 ' : ''}Quick breakdown: Why ${topic} matters in ${niche}`,
    ],
  };

  const bodies: Record<string, string[]> = {
    professional: [
      `In today's ${niche} landscape, ${topic} represents a significant opportunity. The brands and creators who adapt early will lead the next wave of innovation.\n\nHere's what I've observed working with top performers in the space — the ones who invest in understanding ${topic} consistently outperform their peers by meaningful margins.`,
    ],
    casual: [
      `So I've been diving deep into ${topic} lately and honestly? ${e ? '🤯 ' : ''}It's changed the way I think about ${niche} completely.\n\nThe key insight is that you don't need to be perfect — you just need to start. ${e ? '⚡' : ''} Whether you're a beginner or a pro, there's always something new to discover.`,
    ],
    humorous: [
      `Me before ${topic}: "I've got this figured out" ${e ? '😎' : ''}\nMe after ${topic}: "I know nothing" ${e ? '🥲' : ''}\n\nBut seriously, if you're in the ${niche} space, you NEED to check this out. Your future self will thank you. ${e ? '🙏' : ''}`,
    ],
    inspirational: [
      `Every expert was once a beginner. ${e ? '🌱' : ''}\n\nWhen I first started exploring ${topic} in ${niche}, I had no idea where it would lead. Now, looking back, I can see how every small step mattered.\n\nIf you're hesitating to start your ${niche} journey, this is your sign. ${e ? '💫' : ''}`,
    ],
    educational: [
      `Let's break down ${topic} ${e ? '👇' : ''}:\n\n1. Understanding the fundamentals is crucial\n2. Application in the ${niche} space is growing rapidly\n3. The ROI speaks for itself when done right\n\nSave this post for later — you'll want to reference it. ${e ? '📌' : ''}`,
    ],
  };

  const toneKey = (tone.toLowerCase() in hooks) ? tone.toLowerCase() : 'casual';
  const hookArr = hooks[toneKey] || hooks.casual;
  const bodyArr = bodies[toneKey] || bodies.casual;
  const hook = hookArr[Math.floor(Math.random() * hookArr.length)];
  const body = bodyArr[0];

  const platformCTA: Record<string, string> = {
    instagram: `\n\n${e ? '👉 ' : ''}Follow @yourbrand for more ${niche} content.`,
    tiktok: `\n\n${e ? '🔔 ' : ''}Follow for Part 2!`,
    youtube: `\n\n${e ? '🔔 ' : ''}Subscribe and hit the bell for more ${niche} content!`,
    twitter: '',
    linkedin: `\n\nWhat are your thoughts on ${topic}? Let me know in the comments.`,
  };

  const cta = platformCTA[platform.toLowerCase()] || '';
  let caption = `${hook}\n\n${body}${cta}`;

  const hashtagList: string[] = [];
  if (includeHashtags) {
    const tags = [
      `#${niche.replace(/\s+/g, '')}`,
      `#${topic.replace(/\s+/g, '')}`,
      `#${platform.toLowerCase()}marketing`,
      '#contentcreator', '#socialmedia',
      `#${niche.toLowerCase().replace(/\s+/g, '')}tips`,
      '#growthmindset', '#viral',
    ].slice(0, 7);
    caption += '\n\n' + tags.join(' ');
    hashtagList.push(...tags);
  }

  return { caption, hashtags: hashtagList, characterCount: caption.length, source: 'template' };
}

// ============================================================
// PROPOSAL GENERATION — POST /api/ai/proposal
// ============================================================

export interface ProposalInput {
  influencerName: string;
  influencerNiche: string;
  influencerFollowers: number;
  campaignTitle: string;
  campaignCategory: string;
  campaignBudget: number;
  campaignDescription: string;
  proposedRate: number;
}

export interface ProposalOutput {
  proposal: string;
  wordCount: number;
  source: 'gemini' | 'template';
}

export async function generateProposal(input: ProposalInput): Promise<ProposalOutput> {
  const prompt = `Write a professional campaign proposal from an influencer to a brand.

Influencer: ${input.influencerName} (${input.influencerNiche} niche, ${(input.influencerFollowers / 1000).toFixed(0)}K followers)
Campaign: "${input.campaignTitle}" — ${input.campaignCategory}
Campaign Description: ${input.campaignDescription}
Campaign Budget: $${input.campaignBudget.toLocaleString()}
Proposed Rate: $${input.proposedRate}

Write a compelling 150-200 word proposal that:
1. Shows understanding of the brand's campaign goals
2. Highlights the influencer's relevant experience
3. Proposes specific deliverables
4. Mentions expected results
5. Closes with enthusiasm

Write ONLY the proposal text. No subject line, no greeting header.`;

  const geminiResult = await callGemini(prompt);
  if (geminiResult) {
    return { proposal: geminiResult, wordCount: geminiResult.split(/\s+/).length, source: 'gemini' };
  }
  return templateProposal(input);
}

function templateProposal(input: ProposalInput): ProposalOutput {
  const { influencerName, influencerNiche, influencerFollowers, campaignTitle, proposedRate } = input;
  const fk = (influencerFollowers / 1000).toFixed(0);

  const proposal = `I'm excited about the "${campaignTitle}" campaign and believe my expertise in ${influencerNiche} content creation makes me an ideal partner for this initiative.

With ${fk}K engaged followers who closely align with your target audience, I can deliver authentic, high-quality content that resonates and converts. My audience trusts my recommendations, and I maintain a strong engagement rate that consistently outperforms industry benchmarks.

For this collaboration, I propose the following deliverables at a rate of $${proposedRate}:

- 2 dedicated feed posts with professional photography and compelling copy
- 4 Story sequences with swipe-up links and poll/question stickers for engagement
- 1 Reel or short-form video (60-90 seconds) showcasing the product authentically
- Cross-promotion across my secondary platforms for maximum reach

Based on my previous campaigns in similar categories, I project we can achieve 3-5x ROI through a combination of direct engagement, story interactions, and measurable click-through traffic.

I'd love to discuss how we can tailor this approach to maximize results for ${campaignTitle}. Looking forward to the opportunity to create something impactful together!

Best regards,
${influencerName}`;

  return { proposal, wordCount: proposal.split(/\s+/).length, source: 'template' };
}

// ============================================================
// OUTREACH MESSAGE GENERATION — POST /api/ai/outreach
// ============================================================

export interface OutreachInput {
  brandName: string;
  brandIndustry: string;
  influencerName: string;
  influencerNiche: string;
  influencerFollowers: number;
  campaignTitle: string;
  campaignGoal: string;
  messageType: 'initial' | 'follow_up' | 'negotiation';
}

export interface OutreachOutput {
  subject: string;
  message: string;
  wordCount: number;
  source: 'gemini' | 'template';
}

export async function generateOutreach(input: OutreachInput): Promise<OutreachOutput> {
  const typeDesc = input.messageType === 'initial' ? 'first-time outreach invitation'
    : input.messageType === 'follow_up' ? 'polite follow-up message'
    : 'negotiation / counter-offer message';

  const prompt = `Write a ${typeDesc} from a brand to an influencer for a potential collaboration.

Brand: ${input.brandName} (${input.brandIndustry})
Influencer: ${input.influencerName} (${input.influencerNiche}, ${(input.influencerFollowers / 1000).toFixed(0)}K followers)
Campaign: "${input.campaignTitle}"
Campaign Goal: ${input.campaignGoal}

Write a professional yet warm message (100-150 words) that:
1. Acknowledges the influencer's work
2. Explains the campaign briefly
3. Highlights mutual benefits
4. Includes a clear call-to-action

Format: First line is the subject line prefixed with "Subject: ", then a blank line, then the message body. No quotes.`;

  const geminiResult = await callGemini(prompt);
  if (geminiResult) {
    const lines = geminiResult.split('\n');
    let subject = '';
    let body = geminiResult;
    if (lines[0]?.toLowerCase().startsWith('subject:')) {
      subject = lines[0].replace(/^subject:\s*/i, '').trim();
      body = lines.slice(1).join('\n').trim();
    }
    return { subject: subject || `Collaboration: ${input.campaignTitle}`, message: body, wordCount: body.split(/\s+/).length, source: 'gemini' };
  }
  return templateOutreach(input);
}

function templateOutreach(input: OutreachInput): OutreachOutput {
  const { brandName, influencerName, influencerNiche, influencerFollowers, campaignTitle, campaignGoal, messageType } = input;
  const fk = (influencerFollowers / 1000).toFixed(0);

  const templates: Record<string, { subject: string; message: string }> = {
    initial: {
      subject: `Collaboration Opportunity: ${campaignTitle} x ${influencerName}`,
      message: `Hi ${influencerName},

I'm reaching out from ${brandName} because we've been following your incredible work in the ${influencerNiche} space. Your content consistently stands out for its authenticity and engagement, and with ${fk}K dedicated followers, your audience aligns perfectly with our target market.

We're launching "${campaignTitle}" and we believe a collaboration with you would be a fantastic fit. Our goal is to ${campaignGoal.toLowerCase()}, and we think your creative voice would bring this campaign to life in a way that truly resonates.

We'd love to discuss the details, including creative direction, deliverables, and compensation that reflects the value you bring.

Would you be open to a quick call this week to explore this opportunity?

Looking forward to hearing from you!

Warm regards,
${brandName} Team`,
    },
    follow_up: {
      subject: `Following Up: ${campaignTitle} Partnership`,
      message: `Hi ${influencerName},

I wanted to follow up on our previous message regarding the "${campaignTitle}" campaign. We're still very enthusiastic about the possibility of collaborating with you.

We've seen some of your recent ${influencerNiche} content and it continues to reinforce why we think you'd be the perfect partner for this campaign. Your ability to connect authentically with your ${fk}K followers is exactly what we're looking for.

If you're interested, we're flexible on timing and creative approach. We want this to be a partnership that works for both of us.

Would love to hear your thoughts when you have a moment!

Best,
${brandName} Team`,
    },
    negotiation: {
      subject: `Re: ${campaignTitle} — Let's Find the Right Fit`,
      message: `Hi ${influencerName},

Thank you for your interest in the "${campaignTitle}" campaign and for sharing your proposed terms. We value transparency and want to make sure this partnership is rewarding for both sides.

We've reviewed your proposal and would love to discuss a few adjustments to align with our campaign budget while ensuring you're fairly compensated for your exceptional work with your ${fk}K audience.

Here's what we're thinking:
- Adjusted deliverables to match your strengths in ${influencerNiche}
- Performance bonuses tied to engagement metrics
- Extended partnership potential for future campaigns

We believe there's a great middle ground here. Would you be available to discuss this further?

Looking forward to finding the perfect arrangement!

Best regards,
${brandName} Team`,
    },
  };

  const t = templates[messageType] || templates.initial;
  return { subject: t.subject, message: t.message, wordCount: t.message.split(/\s+/).length, source: 'template' };
}

// ============================================================
// UTILITY: Check if Gemini is available
// ============================================================
export function isGeminiAvailable(): boolean {
  return !!GEMINI_API_KEY;
}
