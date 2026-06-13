// ============================================================
// Database Seed Script
// Run: npm run db:seed
// ============================================================

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from './index.js';
import { users, brands, influencers, campaigns, applications, collaborations } from './schema.js';
import { logger } from '../lib/logger.js';

async function seed() {
  logger.info('🌱 Starting database seed...');

  const SALT = 12;

  // ── Users ──
  const brandUserId = uuid();
  const influencerUserId = uuid();
  const adminUserId = uuid();

  await db.insert(users).values([
    { id: brandUserId, email: 'brand@demo.com', passwordHash: await bcrypt.hash('Demo1234!', SALT), role: 'brand', firstName: 'Sarah', lastName: 'Johnson', isVerified: true },
    { id: influencerUserId, email: 'influencer@demo.com', passwordHash: await bcrypt.hash('Demo1234!', SALT), role: 'influencer', firstName: 'Alex', lastName: 'Rivera', isVerified: true },
    { id: adminUserId, email: 'admin@demo.com', passwordHash: await bcrypt.hash('Admin1234!', SALT), role: 'admin', firstName: 'System', lastName: 'Admin', isVerified: true },
  ]);

  // ── Brand ──
  const brandId = uuid();
  await db.insert(brands).values({ id: brandId, userId: brandUserId, companyName: 'TechVibe Inc.', industry: 'Technology', website: 'https://techvibe.com' });

  // ── Influencer ──
  const influencerId = uuid();
  await db.insert(influencers).values({
    id: influencerId, userId: influencerUserId, email: 'influencer@demo.com',
    displayName: 'Alex Rivera', bio: 'Tech enthusiast & content creator with 500K+ followers',
    niche: 'technology', category: 'Technology', totalFollowers: 125000, engagementRate: '5.8',
    pricePerPost: '500', location: 'San Francisco, CA', verified: true,
    audienceAgeGroup: '18-34', audienceGender: '60% Male', previousCampaignScore: 88,
    socialLinks: [{ platform: 'Instagram', url: 'https://instagram.com/alexrivera' }],
  });

  // ── Seed extra influencers ──
  const seedInfluencers = [
    { name: 'Emma Wilson', email: 'emma@demo.com', category: 'Fashion & Beauty', niche: 'fashion', followers: 245000, engagement: '4.8', rate: '500', location: 'Los Angeles, CA', score: 92 },
    { name: 'Jake Chen', email: 'jake@demo.com', category: 'Technology', niche: 'technology', followers: 609000, engagement: '5.2', rate: '800', location: 'San Francisco, CA', score: 95 },
    { name: 'Mia Torres', email: 'mia@demo.com', category: 'Lifestyle & Wellness', niche: 'lifestyle', followers: 500000, engagement: '6.1', rate: '650', location: 'Miami, FL', score: 88 },
    { name: 'Ryan Patel', email: 'ryan@demo.com', category: 'Fitness & Health', niche: 'fitness', followers: 254000, engagement: '7.3', rate: '400', location: 'Austin, TX', score: 85 },
    { name: 'Sophia Kim', email: 'sophia@demo.com', category: 'Food & Cooking', niche: 'food', followers: 730000, engagement: '5.5', rate: '900', location: 'New York, NY', score: 97 },
    { name: 'Marcus Johnson', email: 'marcus@demo.com', category: 'Travel & Adventure', niche: 'travel', followers: 630000, engagement: '4.2', rate: '750', location: 'Denver, CO', score: 90 },
    { name: 'Lily Zhang', email: 'lily@demo.com', category: 'Gaming & Esports', niche: 'gaming', followers: 670000, engagement: '8.1', rate: '700', location: 'Seattle, WA', score: 93 },
  ];

  for (const inf of seedInfluencers) {
    const userId = uuid();
    await db.insert(users).values({ id: userId, email: inf.email, passwordHash: await bcrypt.hash('Demo1234!', SALT), role: 'influencer', firstName: inf.name.split(' ')[0], lastName: inf.name.split(' ')[1] || '' });
    await db.insert(influencers).values({
      id: uuid(), userId, email: inf.email, displayName: inf.name,
      niche: inf.niche, category: inf.category, totalFollowers: inf.followers,
      engagementRate: inf.engagement, pricePerPost: inf.rate, location: inf.location,
      previousCampaignScore: inf.score, audienceAgeGroup: '18-34', audienceGender: 'Mixed',
    });
  }

  // ── Campaigns ──
  const campaignIds = [uuid(), uuid(), uuid()];
  await db.insert(campaigns).values([
    { id: campaignIds[0], brandId, brandName: 'TechVibe Inc.', title: 'Summer Product Launch 2024', description: 'Looking for tech influencers to showcase our new AI-powered gadget line.', category: 'Technology', budget: '15000', targetAudience: '18-34 tech enthusiasts', requirements: 'Min 10K followers, Tech niche, Video content', startDate: '2024-06-01', endDate: '2024-08-31', status: 'active', platforms: ['Instagram', 'YouTube', 'TikTok'] },
    { id: campaignIds[1], brandId, brandName: 'TechVibe Inc.', title: 'Back to School Campaign', description: 'Partner with education and tech influencers for our productivity suite launch.', category: 'Education', budget: '8000', targetAudience: '16-24 students', requirements: 'Education or tech niche', startDate: '2024-08-15', endDate: '2024-09-30', status: 'active', platforms: ['Instagram', 'TikTok'] },
    { id: campaignIds[2], brandId, brandName: 'TechVibe Inc.', title: 'Holiday Gift Guide', description: 'Create holiday gift guide content featuring our top-selling products.', category: 'Lifestyle', budget: '25000', targetAudience: '25-44 professionals', requirements: 'High engagement rate required', startDate: '2024-11-01', endDate: '2024-12-25', status: 'draft', platforms: ['Instagram', 'YouTube'] },
  ]);

  logger.info('✅ Database seeded successfully!');
  process.exit(0);
}

seed().catch(err => { logger.error('Seed failed:', err); process.exit(1); });
