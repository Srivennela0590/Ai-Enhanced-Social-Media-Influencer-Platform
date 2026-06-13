// ============================================================
// Database Service — localStorage CRUD (mirrors Drizzle ORM)
// ============================================================

import type {
  Campaign, Application, Collaboration, Invitation, Influencer, Brand,
} from '@/types';

const KEYS = {
  users: 'influenceai_users',
  brands: 'influenceai_brands',
  influencers: 'influenceai_influencers',
  campaigns: 'influenceai_campaigns',
  applications: 'influenceai_applications',
  collaborations: 'influenceai_collaborations',
  invitations: 'influenceai_invitations',
};

// generic helpers
export function getAll<T>(key: string): T[] {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
}
export function saveAll<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}
export function uid(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
}
function now() {
  return new Date().toISOString();
}

// ======================== CAMPAIGNS ========================

export function getCampaigns(): Campaign[] {
  return getAll<Campaign>(KEYS.campaigns);
}

export function getCampaignsByBrand(brandId: string): Campaign[] {
  return getCampaigns().filter(c => c.brandId === brandId);
}

export function getCampaignById(id: string): Campaign | undefined {
  return getCampaigns().find(c => c.id === id);
}

export function createCampaign(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Campaign {
  const campaigns = getCampaigns();
  const c: Campaign = { ...data, id: uid(), createdAt: now(), updatedAt: now() };
  campaigns.push(c);
  saveAll(KEYS.campaigns, campaigns);
  return c;
}

export function updateCampaign(id: string, data: Partial<Campaign>): Campaign | null {
  const campaigns = getCampaigns();
  const idx = campaigns.findIndex(c => c.id === id);
  if (idx === -1) return null;
  campaigns[idx] = { ...campaigns[idx], ...data, updatedAt: now() };
  saveAll(KEYS.campaigns, campaigns);
  return campaigns[idx];
}

export function deleteCampaign(id: string): boolean {
  const campaigns = getCampaigns();
  const filtered = campaigns.filter(c => c.id !== id);
  if (filtered.length === campaigns.length) return false;
  saveAll(KEYS.campaigns, filtered);
  // cascade delete related records
  saveAll(KEYS.applications, getAll<Application>(KEYS.applications).filter(a => a.campaignId !== id));
  saveAll(KEYS.invitations, getAll<Invitation>(KEYS.invitations).filter(i => i.campaignId !== id));
  saveAll(KEYS.collaborations, getAll<Collaboration>(KEYS.collaborations).filter(c => c.campaignId !== id));
  return true;
}

// ======================== APPLICATIONS ========================

export function getApplications(): Application[] {
  return getAll<Application>(KEYS.applications);
}
export function getApplicationsByCampaign(campaignId: string): Application[] {
  return getApplications().filter(a => a.campaignId === campaignId);
}
export function getApplicationsByInfluencer(influencerId: string): Application[] {
  return getApplications().filter(a => a.influencerId === influencerId);
}
export function createApplication(data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Application {
  const apps = getApplications();
  // prevent duplicate
  if (apps.find(a => a.campaignId === data.campaignId && a.influencerId === data.influencerId)) {
    throw new Error('You have already applied to this campaign');
  }
  const a: Application = { ...data, id: uid(), createdAt: now(), updatedAt: now() };
  apps.push(a);
  saveAll(KEYS.applications, apps);
  return a;
}
export function updateApplicationStatus(id: string, status: Application['status']): Application | null {
  const apps = getApplications();
  const idx = apps.findIndex(a => a.id === id);
  if (idx === -1) return null;
  apps[idx] = { ...apps[idx], status, updatedAt: now() };
  saveAll(KEYS.applications, apps);
  return apps[idx];
}

// ======================== INVITATIONS ========================

export function getInvitations(): Invitation[] {
  return getAll<Invitation>(KEYS.invitations);
}
export function getInvitationsByInfluencer(influencerId: string): Invitation[] {
  return getInvitations().filter(i => i.influencerId === influencerId);
}
export function getInvitationsByBrand(brandId: string): Invitation[] {
  return getInvitations().filter(i => i.brandId === brandId);
}
export function createInvitation(data: Omit<Invitation, 'id' | 'createdAt'>): Invitation {
  const invs = getInvitations();
  if (invs.find(i => i.campaignId === data.campaignId && i.influencerId === data.influencerId)) {
    throw new Error('Influencer already invited to this campaign');
  }
  const inv: Invitation = { ...data, id: uid(), createdAt: now() };
  invs.push(inv);
  saveAll(KEYS.invitations, invs);
  return inv;
}
export function updateInvitationStatus(id: string, status: InvitationStatus): Invitation | null {
  const invs = getInvitations();
  const idx = invs.findIndex(i => i.id === id);
  if (idx === -1) return null;
  invs[idx] = { ...invs[idx], status };
  saveAll(KEYS.invitations, invs);
  return invs[idx];
}
type InvitationStatus = Invitation['status'];

// ======================== COLLABORATIONS ========================

export function getCollaborations(): Collaboration[] {
  return getAll<Collaboration>(KEYS.collaborations);
}
export function getCollaborationsByBrand(brandId: string): Collaboration[] {
  return getCollaborations().filter(c => c.brandId === brandId);
}
export function getCollaborationsByInfluencer(influencerId: string): Collaboration[] {
  return getCollaborations().filter(c => c.influencerId === influencerId);
}
export function createCollaboration(data: Omit<Collaboration, 'id' | 'createdAt' | 'updatedAt'>): Collaboration {
  const collabs = getCollaborations();
  const c: Collaboration = { ...data, id: uid(), createdAt: now(), updatedAt: now() };
  collabs.push(c);
  saveAll(KEYS.collaborations, collabs);
  return c;
}
export function updateCollaborationStatus(id: string, status: Collaboration['status']): Collaboration | null {
  const collabs = getCollaborations();
  const idx = collabs.findIndex(c => c.id === id);
  if (idx === -1) return null;
  collabs[idx] = { ...collabs[idx], status, updatedAt: now() };
  saveAll(KEYS.collaborations, collabs);
  return collabs[idx];
}

// ======================== INFLUENCERS ========================

export function getInfluencers(): Influencer[] {
  return getAll<Influencer>(KEYS.influencers);
}
export function getInfluencerById(id: string): Influencer | undefined {
  return getInfluencers().find(i => i.id === id);
}
export function getInfluencerByUserId(userId: string): Influencer | undefined {
  return getInfluencers().find(i => i.userId === userId);
}
export function updateInfluencer(id: string, data: Partial<Influencer>): Influencer | null {
  const infs = getInfluencers();
  const idx = infs.findIndex(i => i.id === id);
  if (idx === -1) return null;
  infs[idx] = { ...infs[idx], ...data, updatedAt: now() };
  saveAll(KEYS.influencers, infs);
  return infs[idx];
}

// ======================== BRANDS ========================

export function getBrands(): Brand[] {
  return getAll<Brand>(KEYS.brands);
}
export function getBrandByUserId(userId: string): Brand | undefined {
  return getBrands().find(b => b.userId === userId);
}
export function getBrandById(id: string): Brand | undefined {
  return getBrands().find(b => b.id === id);
}

// ======================== SEED ========================

export function ensureSeeded() {
  // Merge seed influencers into existing list
  const existing = getInfluencers();
  const seedIds = SEED_INFLUENCERS.map(s => s.id);
  const hasSeedData = existing.some(e => seedIds.includes(e.id));
  if (!hasSeedData) {
    const merged: Influencer[] = [
      ...existing,
      ...SEED_INFLUENCERS.filter(s => !existing.find(e => e.email === s.email)),
    ];
    saveAll(KEYS.influencers, merged);
  }

  // Patch any influencer records missing required fields
  const allInf = getInfluencers();
  let infDirty = false;
  allInf.forEach((inf: any) => {
    if (!inf.email) { inf.email = ''; infDirty = true; }
    if (!inf.category) { inf.category = (inf.niche || 'Lifestyle').charAt(0).toUpperCase() + (inf.niche || 'lifestyle').slice(1); infDirty = true; }
    if (!inf.audienceAgeGroup) { inf.audienceAgeGroup = '18-34'; infDirty = true; }
    if (!inf.audienceGender) { inf.audienceGender = 'Mixed'; infDirty = true; }
    if (inf.previousCampaignScore === undefined) { inf.previousCampaignScore = 0; infDirty = true; }
    if (!inf.socialLinks) { inf.socialLinks = []; infDirty = true; }
    if (!inf.updatedAt) { inf.updatedAt = inf.createdAt || new Date().toISOString(); infDirty = true; }
  });
  if (infDirty) saveAll(KEYS.influencers, allInf);

  // Ensure invitations array exists
  if (getInvitations().length === 0) {
    saveAll(KEYS.invitations, []);
  }

  // Patch campaigns missing required fields
  const camps = getCampaigns();
  let dirty = false;
  camps.forEach((c: any) => {
    if (!c.category) { c.category = 'Technology'; dirty = true; }
    if (!c.targetAudience) { c.targetAudience = '18-34 tech enthusiasts'; dirty = true; }
    if (typeof c.requirements !== 'string') { c.requirements = Array.isArray(c.requirements) ? c.requirements.join(', ') : ''; dirty = true; }
    if (!c.platforms) { c.platforms = ['Instagram', 'YouTube']; dirty = true; }
  });
  if (dirty) saveAll(KEYS.campaigns, camps);
}

const SEED_INFLUENCERS: Influencer[] = [
  {
    id: 'inf-seed-1', userId: '', email: 'emma.wilson@mail.com', displayName: 'Emma Wilson',
    bio: 'Fashion & beauty creator sharing daily inspiration and honest product reviews.',
    niche: 'fashion', category: 'Fashion & Beauty',
    platforms: [{ name: 'instagram', handle: 'emmawilson', followers: 245000, url: '' }],
    totalFollowers: 245000, engagementRate: 4.8, pricePerPost: 500,
    location: 'Los Angeles, CA', avatarUrl: '', verified: true,
    audienceAgeGroup: '18-34', audienceGender: '72% Female',
    previousCampaignScore: 92,
    socialLinks: [{ platform: 'Instagram', url: 'https://instagram.com/emmawilson' }, { platform: 'TikTok', url: 'https://tiktok.com/@emmawilson' }],
    createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'inf-seed-2', userId: '', email: 'jake.chen@mail.com', displayName: 'Jake Chen',
    bio: 'Tech reviewer and gadget enthusiast. 500+ products reviewed.',
    niche: 'technology', category: 'Technology',
    platforms: [{ name: 'youtube', handle: 'jaketech', followers: 520000, url: '' }, { name: 'twitter', handle: 'jakechen', followers: 89000, url: '' }],
    totalFollowers: 609000, engagementRate: 5.2, pricePerPost: 800,
    location: 'San Francisco, CA', avatarUrl: '', verified: true,
    audienceAgeGroup: '18-44', audienceGender: '64% Male',
    previousCampaignScore: 95,
    socialLinks: [{ platform: 'YouTube', url: 'https://youtube.com/@jaketech' }],
    createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'inf-seed-3', userId: '', email: 'mia.torres@mail.com', displayName: 'Mia Torres',
    bio: 'Lifestyle and wellness advocate helping people live their best life.',
    niche: 'lifestyle', category: 'Lifestyle & Wellness',
    platforms: [{ name: 'instagram', handle: 'miatorres', followers: 180000, url: '' }, { name: 'tiktok', handle: 'mialife', followers: 320000, url: '' }],
    totalFollowers: 500000, engagementRate: 6.1, pricePerPost: 650,
    location: 'Miami, FL', avatarUrl: '', verified: true,
    audienceAgeGroup: '18-34', audienceGender: '78% Female',
    previousCampaignScore: 88,
    socialLinks: [{ platform: 'Instagram', url: 'https://instagram.com/miatorres' }],
    createdAt: '2024-01-20T00:00:00Z', updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'inf-seed-4', userId: '', email: 'ryan.patel@mail.com', displayName: 'Ryan Patel',
    bio: 'Fitness coach and nutrition expert. Certified personal trainer.',
    niche: 'fitness', category: 'Fitness & Health',
    platforms: [{ name: 'instagram', handle: 'ryanfitness', followers: 156000, url: '' }, { name: 'youtube', handle: 'ryanpatel', followers: 98000, url: '' }],
    totalFollowers: 254000, engagementRate: 7.3, pricePerPost: 400,
    location: 'Austin, TX', avatarUrl: '', verified: false,
    audienceAgeGroup: '18-44', audienceGender: '55% Male',
    previousCampaignScore: 85,
    socialLinks: [{ platform: 'Instagram', url: 'https://instagram.com/ryanfitness' }],
    createdAt: '2024-03-05T00:00:00Z', updatedAt: '2024-03-05T00:00:00Z',
  },
  {
    id: 'inf-seed-5', userId: '', email: 'sophia.kim@mail.com', displayName: 'Sophia Kim',
    bio: 'Food blogger and recipe developer. Cookbook author.',
    niche: 'food', category: 'Food & Cooking',
    platforms: [{ name: 'instagram', handle: 'sophiaeats', followers: 310000, url: '' }, { name: 'tiktok', handle: 'sophiakitchen', followers: 420000, url: '' }],
    totalFollowers: 730000, engagementRate: 5.5, pricePerPost: 900,
    location: 'New York, NY', avatarUrl: '', verified: true,
    audienceAgeGroup: '25-44', audienceGender: '68% Female',
    previousCampaignScore: 97,
    socialLinks: [{ platform: 'Instagram', url: 'https://instagram.com/sophiaeats' }, { platform: 'TikTok', url: 'https://tiktok.com/@sophiakitchen' }],
    createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'inf-seed-6', userId: '', email: 'marcus.j@mail.com', displayName: 'Marcus Johnson',
    bio: 'Travel photographer and adventure seeker. 50+ countries explored.',
    niche: 'travel', category: 'Travel & Adventure',
    platforms: [{ name: 'instagram', handle: 'marcustravels', followers: 420000, url: '' }, { name: 'youtube', handle: 'marcusj', followers: 210000, url: '' }],
    totalFollowers: 630000, engagementRate: 4.2, pricePerPost: 750,
    location: 'Denver, CO', avatarUrl: '', verified: true,
    audienceAgeGroup: '25-44', audienceGender: '52% Male',
    previousCampaignScore: 90,
    socialLinks: [{ platform: 'YouTube', url: 'https://youtube.com/@marcusj' }],
    createdAt: '2024-02-15T00:00:00Z', updatedAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'inf-seed-7', userId: '', email: 'lily.zhang@mail.com', displayName: 'Lily Zhang',
    bio: 'Gaming streamer and esports commentator. Building inclusive gaming communities.',
    niche: 'gaming', category: 'Gaming & Esports',
    platforms: [{ name: 'youtube', handle: 'lilygaming', followers: 380000, url: '' }, { name: 'tiktok', handle: 'lilyplays', followers: 290000, url: '' }],
    totalFollowers: 670000, engagementRate: 8.1, pricePerPost: 700,
    location: 'Seattle, WA', avatarUrl: '', verified: true,
    audienceAgeGroup: '13-34', audienceGender: '58% Male',
    previousCampaignScore: 93,
    socialLinks: [{ platform: 'YouTube', url: 'https://youtube.com/@lilygaming' }],
    createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'inf-seed-8', userId: '', email: 'david.park@mail.com', displayName: 'David Park',
    bio: 'Education content creator making learning fun. Former teacher turned YouTuber.',
    niche: 'education', category: 'Education',
    platforms: [{ name: 'youtube', handle: 'davidlearns', followers: 190000, url: '' }],
    totalFollowers: 190000, engagementRate: 9.4, pricePerPost: 350,
    location: 'Chicago, IL', avatarUrl: '', verified: false,
    audienceAgeGroup: '13-24', audienceGender: '48% Male',
    previousCampaignScore: 82,
    socialLinks: [{ platform: 'YouTube', url: 'https://youtube.com/@davidlearns' }],
    createdAt: '2024-04-01T00:00:00Z', updatedAt: '2024-04-01T00:00:00Z',
  },
];
