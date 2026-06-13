// ============================================================
// Drizzle ORM Schema for MySQL
// ============================================================
// This file defines the complete database schema for the
// AI-Enhanced Social Media Influencer Platform.
//
// In a production Next.js environment, install:
//   npm install drizzle-orm mysql2
//   npm install -D drizzle-kit
//
// Then run: npx drizzle-kit generate:mysql
//           npx drizzle-kit push:mysql
// ============================================================

// NOTE: This is a reference schema. In a Vite SPA, the database
// operations are simulated via localStorage. In production,
// this schema would be used with a real MySQL connection.

export const drizzleSchema = `
import { mysqlTable, varchar, text, int, decimal, boolean, timestamp, json, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ===================== USERS TABLE =====================
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['brand', 'influencer']).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ===================== BRANDS TABLE =====================
export const brands = mysqlTable('brands', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  industry: varchar('industry', { length: 100 }).notNull(),
  website: varchar('website', { length: 500 }),
  description: text('description'),
  logoUrl: varchar('logo_url', { length: 500 }),
  budget: decimal('budget', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================== INFLUENCERS TABLE =====================
export const influencers = mysqlTable('influencers', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  bio: text('bio'),
  niche: varchar('niche', { length: 100 }).notNull(),
  platforms: json('platforms').notNull(),
  totalFollowers: int('total_followers').default(0).notNull(),
  engagementRate: decimal('engagement_rate', { precision: 5, scale: 2 }).default('0').notNull(),
  pricePerPost: decimal('price_per_post', { precision: 10, scale: 2 }),
  location: varchar('location', { length: 255 }),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===================== CAMPAIGNS TABLE =====================
export const campaigns = mysqlTable('campaigns', {
  id: varchar('id', { length: 36 }).primaryKey(),
  brandId: varchar('brand_id', { length: 36 }).notNull().references(() => brands.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  budget: decimal('budget', { precision: 12, scale: 2 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: mysqlEnum('status', ['draft', 'active', 'paused', 'completed', 'cancelled']).default('draft').notNull(),
  requirements: json('requirements').notNull(),
  targetNiche: json('target_niche').notNull(),
  minFollowers: int('min_followers').default(0).notNull(),
  platforms: json('platforms').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ===================== APPLICATIONS TABLE =====================
export const applications = mysqlTable('applications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  campaignId: varchar('campaign_id', { length: 36 }).notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  influencerId: varchar('influencer_id', { length: 36 }).notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  status: mysqlEnum('status', ['pending', 'accepted', 'rejected', 'withdrawn']).default('pending').notNull(),
  proposal: text('proposal').notNull(),
  proposedRate: decimal('proposed_rate', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ===================== COLLABORATIONS TABLE =====================
export const collaborations = mysqlTable('collaborations', {
  id: varchar('id', { length: 36 }).primaryKey(),
  campaignId: varchar('campaign_id', { length: 36 }).notNull().references(() => campaigns.id),
  brandId: varchar('brand_id', { length: 36 }).notNull().references(() => brands.id),
  influencerId: varchar('influencer_id', { length: 36 }).notNull().references(() => influencers.id),
  applicationId: varchar('application_id', { length: 36 }).notNull().references(() => applications.id),
  status: mysqlEnum('status', ['negotiation', 'in_progress', 'content_review', 'completed', 'disputed']).default('negotiation').notNull(),
  agreedRate: decimal('agreed_rate', { precision: 10, scale: 2 }).notNull(),
  deliverables: json('deliverables').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ===================== RELATIONS =====================
export const usersRelations = relations(users, ({ one }) => ({
  brand: one(brands, { fields: [users.id], references: [brands.userId] }),
  influencer: one(influencers, { fields: [users.id], references: [influencers.userId] }),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  user: one(users, { fields: [brands.userId], references: [users.id] }),
  campaigns: many(campaigns),
  collaborations: many(collaborations),
}));

export const influencersRelations = relations(influencers, ({ one, many }) => ({
  user: one(users, { fields: [influencers.userId], references: [users.id] }),
  applications: many(applications),
  collaborations: many(collaborations),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  brand: one(brands, { fields: [campaigns.brandId], references: [brands.id] }),
  applications: many(applications),
  collaborations: many(collaborations),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  campaign: one(campaigns, { fields: [applications.campaignId], references: [campaigns.id] }),
  influencer: one(influencers, { fields: [applications.influencerId], references: [influencers.id] }),
}));

export const collaborationsRelations = relations(collaborations, ({ one }) => ({
  campaign: one(campaigns, { fields: [collaborations.campaignId], references: [campaigns.id] }),
  brand: one(brands, { fields: [collaborations.brandId], references: [brands.id] }),
  influencer: one(influencers, { fields: [collaborations.influencerId], references: [influencers.id] }),
  application: one(applications, { fields: [collaborations.applicationId], references: [applications.id] }),
}));
`;

export default drizzleSchema;
