// ============================================================
// Drizzle ORM Schema — Complete Production Database
// ============================================================

import {
  mysqlTable, varchar, text, int, decimal, boolean,
  timestamp, json, mysqlEnum, index, uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ========================= USERS =========================

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['brand', 'influencer', 'admin']).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  isVerified: boolean('is_verified').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  googleId: varchar('google_id', { length: 255 }),
  linkedinId: varchar('linkedin_id', { length: 255 }),
  resetToken: varchar('reset_token', { length: 255 }),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index('idx_users_email').on(table.email),
  index('idx_users_role').on(table.role),
  index('idx_users_google').on(table.googleId),
]);

// ========================= BRANDS =========================

export const brands = mysqlTable('brands', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  industry: varchar('industry', { length: 100 }).notNull(),
  website: varchar('website', { length: 500 }),
  description: text('description'),
  logoUrl: varchar('logo_url', { length: 500 }),
  budget: decimal('budget', { precision: 12, scale: 2 }).default('0'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  avgRating: decimal('avg_rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: int('total_reviews').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_brands_user').on(table.userId),
  index('idx_brands_industry').on(table.industry),
]);

// ======================== INFLUENCERS ========================

export const influencers = mysqlTable('influencers', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  bio: text('bio'),
  niche: varchar('niche', { length: 100 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  platforms: json('platforms').$type<{ name: string; handle: string; followers: number; url?: string }[]>().default([]),
  totalFollowers: int('total_followers').default(0).notNull(),
  engagementRate: decimal('engagement_rate', { precision: 5, scale: 2 }).default('0').notNull(),
  pricePerPost: decimal('price_per_post', { precision: 10, scale: 2 }),
  location: varchar('location', { length: 255 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  verified: boolean('verified').default(false).notNull(),
  audienceAgeGroup: varchar('audience_age_group', { length: 50 }).default('18-34'),
  audienceGender: varchar('audience_gender', { length: 50 }).default('Mixed'),
  previousCampaignScore: int('previous_campaign_score').default(0).notNull(),
  socialLinks: json('social_links').$type<{ platform: string; url: string }[]>().default([]),
  stripeAccountId: varchar('stripe_account_id', { length: 255 }),
  walletBalance: decimal('wallet_balance', { precision: 12, scale: 2 }).default('0'),
  avgRating: decimal('avg_rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: int('total_reviews').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex('idx_influencers_user').on(table.userId),
  index('idx_influencers_category').on(table.category),
  index('idx_influencers_niche').on(table.niche),
  index('idx_influencers_followers').on(table.totalFollowers),
  index('idx_influencers_location').on(table.location),
]);

// ======================== CAMPAIGNS ========================

export const campaigns = mysqlTable('campaigns', {
  id: varchar('id', { length: 36 }).primaryKey(),
  brandId: varchar('brand_id', { length: 36 }).notNull().references(() => brands.id, { onDelete: 'cascade' }),
  brandName: varchar('brand_name', { length: 255 }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  budget: decimal('budget', { precision: 12, scale: 2 }).notNull(),
  targetAudience: varchar('target_audience', { length: 500 }),
  requirements: text('requirements'),
  startDate: varchar('start_date', { length: 20 }),
  endDate: varchar('end_date', { length: 20 }),
  status: mysqlEnum('status', ['draft', 'active', 'paused', 'completed', 'cancelled']).default('draft').notNull(),
  platforms: json('platforms').$type<string[]>().default([]),
  mediaUrls: json('media_urls').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index('idx_campaigns_brand').on(table.brandId),
  index('idx_campaigns_status').on(table.status),
  index('idx_campaigns_category').on(table.category),
]);

// ======================= APPLICATIONS =======================

export const applications = mysqlTable('applications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  campaignId: varchar('campaign_id', { length: 36 }).notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  campaignTitle: varchar('campaign_title', { length: 255 }),
  influencerId: varchar('influencer_id', { length: 36 }).notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  influencerName: varchar('influencer_name', { length: 255 }),
  influencerFollowers: int('influencer_followers'),
  influencerEngagement: decimal('influencer_engagement', { precision: 5, scale: 2 }),
  influencerCategory: varchar('influencer_category', { length: 100 }),
  status: mysqlEnum('status', ['pending', 'accepted', 'rejected', 'withdrawn']).default('pending').notNull(),
  proposal: text('proposal').notNull(),
  proposedRate: decimal('proposed_rate', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index('idx_applications_campaign').on(table.campaignId),
  index('idx_applications_influencer').on(table.influencerId),
  index('idx_applications_status').on(table.status),
  uniqueIndex('idx_applications_unique').on(table.campaignId, table.influencerId),
]);

// ======================= INVITATIONS =======================

export const invitations = mysqlTable('invitations', {
  id: varchar('id', { length: 36 }).primaryKey(),
  campaignId: varchar('campaign_id', { length: 36 }).notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  campaignTitle: varchar('campaign_title', { length: 255 }),
  brandId: varchar('brand_id', { length: 36 }).notNull().references(() => brands.id, { onDelete: 'cascade' }),
  brandName: varchar('brand_name', { length: 255 }),
  influencerId: varchar('influencer_id', { length: 36 }).notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  influencerName: varchar('influencer_name', { length: 255 }),
  message: text('message'),
  status: mysqlEnum('status', ['pending', 'accepted', 'declined']).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_invitations_campaign').on(table.campaignId),
  index('idx_invitations_influencer').on(table.influencerId),
  index('idx_invitations_brand').on(table.brandId),
]);

// ====================== COLLABORATIONS ======================

export const collaborations = mysqlTable('collaborations', {
  id: varchar('id', { length: 36 }).primaryKey(),
  campaignId: varchar('campaign_id', { length: 36 }).notNull().references(() => campaigns.id),
  campaignTitle: varchar('campaign_title', { length: 255 }),
  brandId: varchar('brand_id', { length: 36 }).notNull().references(() => brands.id),
  brandName: varchar('brand_name', { length: 255 }),
  influencerId: varchar('influencer_id', { length: 36 }).notNull().references(() => influencers.id),
  influencerName: varchar('influencer_name', { length: 255 }),
  status: mysqlEnum('status', ['negotiation', 'in_progress', 'content_review', 'completed', 'disputed']).default('negotiation').notNull(),
  agreedRate: decimal('agreed_rate', { precision: 10, scale: 2 }).notNull(),
  deliverables: text('deliverables'),
  startDate: varchar('start_date', { length: 20 }),
  endDate: varchar('end_date', { length: 20 }),
  rating: int('rating'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index('idx_collaborations_campaign').on(table.campaignId),
  index('idx_collaborations_brand').on(table.brandId),
  index('idx_collaborations_influencer').on(table.influencerId),
  index('idx_collaborations_status').on(table.status),
]);

// ========================= MESSAGES =========================

export const messages = mysqlTable('messages', {
  id: varchar('id', { length: 36 }).primaryKey(),
  conversationId: varchar('conversation_id', { length: 36 }).notNull(),
  senderId: varchar('sender_id', { length: 36 }).notNull().references(() => users.id),
  receiverId: varchar('receiver_id', { length: 36 }).notNull().references(() => users.id),
  content: text('content').notNull(),
  messageType: mysqlEnum('message_type', ['text', 'image', 'file']).default('text').notNull(),
  fileUrl: varchar('file_url', { length: 500 }),
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_messages_conversation').on(table.conversationId),
  index('idx_messages_sender').on(table.senderId),
  index('idx_messages_receiver').on(table.receiverId),
]);

// ========================= REVIEWS =========================

export const reviews = mysqlTable('reviews', {
  id: varchar('id', { length: 36 }).primaryKey(),
  collaborationId: varchar('collaboration_id', { length: 36 }).notNull().references(() => collaborations.id),
  reviewerId: varchar('reviewer_id', { length: 36 }).notNull().references(() => users.id),
  revieweeId: varchar('reviewee_id', { length: 36 }).notNull().references(() => users.id),
  rating: int('rating').notNull(),
  comment: text('comment'),
  isApproved: boolean('is_approved').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_reviews_collab').on(table.collaborationId),
  index('idx_reviews_reviewee').on(table.revieweeId),
  uniqueIndex('idx_reviews_unique').on(table.collaborationId, table.reviewerId),
]);

// ======================== PAYMENTS =========================

export const payments = mysqlTable('payments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  collaborationId: varchar('collaboration_id', { length: 36 }).references(() => collaborations.id),
  payerId: varchar('payer_id', { length: 36 }).notNull().references(() => users.id),
  payeeId: varchar('payee_id', { length: 36 }).notNull().references(() => users.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: mysqlEnum('status', ['pending', 'processing', 'completed', 'failed', 'refunded']).default('pending').notNull(),
  stripePaymentId: varchar('stripe_payment_id', { length: 255 }),
  stripeTransferId: varchar('stripe_transfer_id', { length: 255 }),
  invoiceUrl: varchar('invoice_url', { length: 500 }),
  description: varchar('description', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index('idx_payments_payer').on(table.payerId),
  index('idx_payments_payee').on(table.payeeId),
  index('idx_payments_status').on(table.status),
]);

// ====================== NOTIFICATIONS ======================

export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: mysqlEnum('type', [
    'campaign_invite', 'application_received', 'application_update',
    'collaboration_update', 'payment_received', 'payment_sent',
    'review_received', 'message_received', 'system',
  ]).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  data: json('data').$type<Record<string, unknown>>(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_notifications_user').on(table.userId),
  index('idx_notifications_read').on(table.isRead),
]);

// ======================== RELATIONS ========================

export const usersRelations = relations(users, ({ one }) => ({
  brand: one(brands, { fields: [users.id], references: [brands.userId] }),
  influencer: one(influencers, { fields: [users.id], references: [influencers.userId] }),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  user: one(users, { fields: [brands.userId], references: [users.id] }),
  campaigns: many(campaigns),
  collaborations: many(collaborations),
  invitations: many(invitations),
}));

export const influencersRelations = relations(influencers, ({ one, many }) => ({
  user: one(users, { fields: [influencers.userId], references: [users.id] }),
  applications: many(applications),
  collaborations: many(collaborations),
  invitations: many(invitations),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  brand: one(brands, { fields: [campaigns.brandId], references: [brands.id] }),
  applications: many(applications),
  collaborations: many(collaborations),
  invitations: many(invitations),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  campaign: one(campaigns, { fields: [applications.campaignId], references: [campaigns.id] }),
  influencer: one(influencers, { fields: [applications.influencerId], references: [influencers.id] }),
}));

export const collaborationsRelations = relations(collaborations, ({ one, many }) => ({
  campaign: one(campaigns, { fields: [collaborations.campaignId], references: [campaigns.id] }),
  brand: one(brands, { fields: [collaborations.brandId], references: [brands.id] }),
  influencer: one(influencers, { fields: [collaborations.influencerId], references: [influencers.id] }),
  reviews: many(reviews),
  payments: many(payments),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  collaboration: one(collaborations, { fields: [reviews.collaborationId], references: [collaborations.id] }),
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  collaboration: one(collaborations, { fields: [payments.collaborationId], references: [collaborations.id] }),
}));
