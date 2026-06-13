// ============================================================
// Database Schema Types (mirrors Drizzle ORM schema)
// ============================================================

export type UserRole = 'brand' | 'influencer';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  budget?: number;
  createdAt: string;
}

export interface Influencer {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  bio?: string;
  niche: string;
  category: string;
  platforms: SocialPlatform[];
  totalFollowers: number;
  engagementRate: number;
  pricePerPost?: number;
  location?: string;
  avatarUrl?: string;
  verified: boolean;
  audienceAgeGroup: string;
  audienceGender: string;
  previousCampaignScore: number;
  socialLinks: SocialLink[];
  createdAt: string;
  updatedAt: string;
}

export interface SocialPlatform {
  name: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin';
  handle: string;
  followers: number;
  url?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Campaign {
  id: string;
  brandId: string;
  brandName?: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  targetAudience: string;
  requirements: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  platforms: string[];
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface Application {
  id: string;
  campaignId: string;
  campaignTitle?: string;
  influencerId: string;
  influencerName?: string;
  influencerAvatar?: string;
  influencerFollowers?: number;
  influencerEngagement?: number;
  influencerCategory?: string;
  status: ApplicationStatus;
  proposal: string;
  proposedRate: number;
  createdAt: string;
  updatedAt: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface Invitation {
  id: string;
  campaignId: string;
  campaignTitle?: string;
  brandId: string;
  brandName?: string;
  influencerId: string;
  influencerName?: string;
  message: string;
  status: InvitationStatus;
  createdAt: string;
}

export type CollaborationStatus = 'negotiation' | 'in_progress' | 'content_review' | 'completed' | 'disputed';

export interface Collaboration {
  id: string;
  campaignId: string;
  campaignTitle?: string;
  brandId: string;
  brandName?: string;
  influencerId: string;
  influencerName?: string;
  status: CollaborationStatus;
  agreedRate: number;
  deliverables: string;
  startDate: string;
  endDate: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Auth Types
// ============================================================

export interface AuthState {
  user: SafeUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type SafeUser = Omit<User, 'passwordHash'>;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyName?: string;
  industry?: string;
  website?: string;
  displayName?: string;
  niche?: string;
  bio?: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// ============================================================
// API Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalApplications: number;
  totalCollaborations: number;
  totalBudget: number;
  totalEarnings: number;
}
