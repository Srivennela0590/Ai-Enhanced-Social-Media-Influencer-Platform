import bcrypt from 'bcryptjs';
import type { User, SafeUser, LoginCredentials, RegisterData, JWTPayload, UserRole } from '@/types';
import { ensureSeeded } from '@/services/db';

const JWT_SECRET = 'influenceai-jwt-secret-key-2024';
const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

function base64Encode(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))));
}

function base64Decode(str: string): string {
  return decodeURIComponent(
    atob(str).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}

export function createToken(user: SafeUser): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: JWTPayload = { sub: user.id, email: user.email, role: user.role, iat: Date.now(), exp: Date.now() + TOKEN_EXPIRY };
  const headerB64 = base64Encode(JSON.stringify(header));
  const payloadB64 = base64Encode(JSON.stringify(payload));
  const signature = base64Encode(JSON.stringify({ data: `${headerB64}.${payloadB64}`, secret: JWT_SECRET }));
  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload: JWTPayload = JSON.parse(base64Decode(parts[1]));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64Decode(parts[1]));
  } catch { return null; }
}

const SALT_ROUNDS = 10;
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const DB_KEYS = {
  users: 'influenceai_users',
  brands: 'influenceai_brands',
  influencers: 'influenceai_influencers',
  campaigns: 'influenceai_campaigns',
  applications: 'influenceai_applications',
  collaborations: 'influenceai_collaborations',
  invitations: 'influenceai_invitations',
};

function getCollection<T>(key: string): T[] {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : []; } catch { return []; }
}
function saveCollection<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export async function register(data: RegisterData): Promise<{ user: SafeUser; token: string }> {
  const users = getCollection<User>(DB_KEYS.users);
  if (users.find(u => u.email === data.email)) {
    throw new Error('An account with this email already exists');
  }
  const passwordHash = await hashPassword(data.password);
  const now = new Date().toISOString();
  const userId = generateId();

  const newUser: User = {
    id: userId, email: data.email, passwordHash, role: data.role,
    firstName: data.firstName, lastName: data.lastName,
    isVerified: false, createdAt: now, updatedAt: now,
  };
  users.push(newUser);
  saveCollection(DB_KEYS.users, users);

  if (data.role === 'brand') {
    const brands = getCollection(DB_KEYS.brands);
    brands.push({
      id: generateId(), userId, companyName: data.companyName || `${data.firstName}'s Company`,
      industry: data.industry || 'Technology', website: data.website || '',
      description: '', logoUrl: '', budget: 0, createdAt: now,
    });
    saveCollection(DB_KEYS.brands, brands);
  } else {
    const influencers = getCollection(DB_KEYS.influencers);
    influencers.push({
      id: generateId(), userId, email: data.email,
      displayName: data.displayName || `${data.firstName} ${data.lastName}`,
      bio: data.bio || '', niche: data.niche || 'lifestyle',
      category: (data.niche || 'Lifestyle').charAt(0).toUpperCase() + (data.niche || 'lifestyle').slice(1),
      platforms: [], totalFollowers: 0, engagementRate: 0, pricePerPost: 0,
      location: '', verified: false,
      audienceAgeGroup: '18-34', audienceGender: 'Mixed',
      previousCampaignScore: 0, socialLinks: [],
      createdAt: now, updatedAt: now,
    });
    saveCollection(DB_KEYS.influencers, influencers);
  }

  const safeUser = toSafeUser(newUser);
  const token = createToken(safeUser);
  return { user: safeUser, token };
}

export async function login(credentials: LoginCredentials): Promise<{ user: SafeUser; token: string }> {
  const users = getCollection<User>(DB_KEYS.users);
  const user = users.find(u => u.email === credentials.email);
  if (!user) throw new Error('Invalid email or password');
  const isValid = await comparePassword(credentials.password, user.passwordHash);
  if (!isValid) throw new Error('Invalid email or password');
  const safeUser = toSafeUser(user);
  const token = createToken(safeUser);
  return { user: safeUser, token };
}

export function logout(): void {
  localStorage.removeItem('influenceai_token');
  localStorage.removeItem('influenceai_user');
}

export function getCurrentUser(): SafeUser | null {
  try {
    const token = localStorage.getItem('influenceai_token');
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload) { logout(); return null; }
    const userStr = localStorage.getItem('influenceai_user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch { return null; }
}

export function saveSession(user: SafeUser, token: string): void {
  localStorage.setItem('influenceai_token', token);
  localStorage.setItem('influenceai_user', JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem('influenceai_token');
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  return verifyToken(token) !== null;
}

export function hasRole(role: UserRole): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

function toSafeUser(user: User): SafeUser {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

// ============================================================
// Seed Demo Data
// ============================================================

export async function seedDemoData(): Promise<void> {
  const users = getCollection<User>(DB_KEYS.users);
  if (users.length === 0) {
    // Create demo brand
    await register({
      email: 'brand@demo.com', password: 'Demo1234!',
      firstName: 'Sarah', lastName: 'Johnson', role: 'brand',
      companyName: 'TechVibe Inc.', industry: 'Technology', website: 'https://techvibe.com',
    });

    // Create demo influencer
    await register({
      email: 'influencer@demo.com', password: 'Demo1234!',
      firstName: 'Alex', lastName: 'Rivera', role: 'influencer',
      displayName: 'Alex Rivera', niche: 'technology',
      bio: 'Tech enthusiast & content creator with 500K+ followers',
    });

    // Upgrade the demo influencer profile with real stats
    const infList = getCollection<any>(DB_KEYS.influencers);
    const demoInf = infList.find((i: any) => i.email === 'influencer@demo.com');
    if (demoInf) {
      demoInf.totalFollowers = 125000;
      demoInf.engagementRate = 5.8;
      demoInf.pricePerPost = 500;
      demoInf.location = 'San Francisco, CA';
      demoInf.verified = true;
      demoInf.previousCampaignScore = 88;
      demoInf.category = 'Technology';
      demoInf.socialLinks = [{ platform: 'Instagram', url: 'https://instagram.com/alexrivera' }];
      saveCollection(DB_KEYS.influencers, infList);
    }

    // Seed campaigns
    const brands = getCollection<{ id: string; companyName: string }>(DB_KEYS.brands);
    if (brands.length > 0) {
      const campaigns = [
        { id: generateId(), brandId: brands[0].id, brandName: brands[0].companyName, title: 'Summer Product Launch 2024', description: 'Looking for tech influencers to showcase our new AI-powered gadget line with unboxing and review content.', category: 'Technology', budget: 15000, targetAudience: '18-34 tech enthusiasts', requirements: 'Min 10K followers, Tech niche, Video content', startDate: '2024-06-01', endDate: '2024-08-31', status: 'active' as const, platforms: ['Instagram', 'YouTube', 'TikTok'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), brandId: brands[0].id, brandName: brands[0].companyName, title: 'Back to School Campaign', description: 'Partner with education and tech influencers for our productivity suite launch.', category: 'Education', budget: 8000, targetAudience: '16-24 students', requirements: 'Education or tech niche', startDate: '2024-08-15', endDate: '2024-09-30', status: 'active' as const, platforms: ['Instagram', 'TikTok'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), brandId: brands[0].id, brandName: brands[0].companyName, title: 'Holiday Gift Guide', description: 'Create holiday gift guide content featuring our top-selling products.', category: 'Lifestyle', budget: 25000, targetAudience: '25-44 professionals', requirements: 'High engagement rate required', startDate: '2024-11-01', endDate: '2024-12-25', status: 'draft' as const, platforms: ['Instagram', 'YouTube'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), brandId: brands[0].id, brandName: brands[0].companyName, title: 'Fitness App Launch', description: 'Promote our AI-powered fitness tracking app.', category: 'Fitness & Health', budget: 12000, targetAudience: '18-44 fitness enthusiasts', requirements: 'Fitness niche, App demo', startDate: '2024-07-01', endDate: '2024-09-30', status: 'active' as const, platforms: ['Instagram', 'TikTok', 'YouTube'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), brandId: brands[0].id, brandName: brands[0].companyName, title: 'Sustainable Living Series', description: 'Partner with eco-conscious creators.', category: 'Lifestyle', budget: 18000, targetAudience: '25-44 eco-conscious consumers', requirements: 'Sustainability focus', startDate: '2024-09-01', endDate: '2024-11-30', status: 'paused' as const, platforms: ['Instagram', 'YouTube'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), brandId: brands[0].id, brandName: brands[0].companyName, title: 'Gaming Peripherals Review', description: 'In-depth reviews of our newest gaming gear.', category: 'Gaming', budget: 10000, targetAudience: '16-34 gamers', requirements: 'Gaming niche, YouTube presence', startDate: '2024-10-01', endDate: '2024-12-15', status: 'completed' as const, platforms: ['YouTube', 'TikTok'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      saveCollection(DB_KEYS.campaigns, campaigns);

      // Seed applications using seed influencer IDs
      const apps = [
        { id: generateId(), campaignId: campaigns[0].id, influencerId: 'inf-seed-2', campaignTitle: campaigns[0].title, influencerName: 'Jake Chen', influencerFollowers: 609000, influencerEngagement: 5.2, influencerCategory: 'Technology', status: 'pending' as const, proposal: 'I can create 3 high-quality unboxing videos.', proposedRate: 800, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), campaignId: campaigns[0].id, influencerId: 'inf-seed-1', campaignTitle: campaigns[0].title, influencerName: 'Emma Wilson', influencerFollowers: 245000, influencerEngagement: 4.8, influencerCategory: 'Fashion & Beauty', status: 'accepted' as const, proposal: 'Lifestyle integration content.', proposedRate: 500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), campaignId: campaigns[1].id, influencerId: 'inf-seed-8', campaignTitle: campaigns[1].title, influencerName: 'David Park', influencerFollowers: 190000, influencerEngagement: 9.4, influencerCategory: 'Education', status: 'pending' as const, proposal: 'Educational tutorial series.', proposedRate: 350, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), campaignId: campaigns[3].id, influencerId: 'inf-seed-4', campaignTitle: campaigns[3].title, influencerName: 'Ryan Patel', influencerFollowers: 254000, influencerEngagement: 7.3, influencerCategory: 'Fitness & Health', status: 'accepted' as const, proposal: 'Full workout series with progress tracking.', proposedRate: 400, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), campaignId: campaigns[0].id, influencerId: 'inf-seed-3', campaignTitle: campaigns[0].title, influencerName: 'Mia Torres', influencerFollowers: 500000, influencerEngagement: 6.1, influencerCategory: 'Lifestyle & Wellness', status: 'rejected' as const, proposal: 'Lifestyle integration with tech wellness angle.', proposedRate: 650, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      saveCollection(DB_KEYS.applications, apps);

      // Seed collaborations
      const collabs = [
        { id: generateId(), campaignId: campaigns[0].id, campaignTitle: campaigns[0].title, brandId: brands[0].id, brandName: brands[0].companyName, influencerId: 'inf-seed-1', influencerName: 'Emma Wilson', status: 'in_progress' as const, agreedRate: 500, deliverables: '2 Instagram posts, 3 Stories, 1 Reel', startDate: '2024-06-15', endDate: '2024-07-15', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), campaignId: campaigns[3].id, campaignTitle: campaigns[3].title, brandId: brands[0].id, brandName: brands[0].companyName, influencerId: 'inf-seed-4', influencerName: 'Ryan Patel', status: 'content_review' as const, agreedRate: 400, deliverables: '30-day workout series, 5 YouTube videos', startDate: '2024-07-01', endDate: '2024-08-15', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), campaignId: campaigns[5].id, campaignTitle: campaigns[5].title, brandId: brands[0].id, brandName: brands[0].companyName, influencerId: 'inf-seed-7', influencerName: 'Lily Zhang', status: 'completed' as const, agreedRate: 700, rating: 5, deliverables: '3 detailed review videos, 5 short-form clips', startDate: '2024-10-01', endDate: '2024-11-30', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      saveCollection(DB_KEYS.collaborations, collabs);
    }

    logout();
  }

  ensureSeeded();
}
