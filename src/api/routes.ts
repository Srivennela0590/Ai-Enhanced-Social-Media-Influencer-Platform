// ============================================================
// API Routes Reference
// ============================================================
// In a production Next.js 15 environment, these would be
// implemented as Route Handlers in the app/api directory.
//
// This file documents the complete API surface.
// ============================================================

export const API_ROUTES = {
  // ==================== AUTH ====================
  auth: {
    register: {
      method: 'POST',
      path: '/api/auth/register',
      body: '{ email, password, firstName, lastName, role, ...roleSpecificFields }',
      response: '{ user, token }',
      description: 'Register a new user with role-specific profile creation',
    },
    login: {
      method: 'POST',
      path: '/api/auth/login',
      body: '{ email, password }',
      response: '{ user, token }',
      description: 'Authenticate user and return JWT token',
    },
    logout: {
      method: 'POST',
      path: '/api/auth/logout',
      description: 'Invalidate user session and clear token',
    },
    me: {
      method: 'GET',
      path: '/api/auth/me',
      headers: 'Authorization: Bearer <token>',
      response: '{ user }',
      description: 'Get current authenticated user details',
    },
    refreshToken: {
      method: 'POST',
      path: '/api/auth/refresh',
      body: '{ refreshToken }',
      response: '{ token, refreshToken }',
      description: 'Refresh JWT access token',
    },
  },

  // ==================== USERS ====================
  users: {
    getProfile: {
      method: 'GET',
      path: '/api/users/:id',
      response: '{ user, brand? | influencer? }',
      description: 'Get user profile with role-specific details',
    },
    updateProfile: {
      method: 'PATCH',
      path: '/api/users/:id',
      body: '{ firstName?, lastName?, avatarUrl?, ...roleFields }',
      response: '{ user }',
      description: 'Update user profile',
    },
    changePassword: {
      method: 'POST',
      path: '/api/users/:id/change-password',
      body: '{ currentPassword, newPassword }',
      description: 'Change user password with current password verification',
    },
  },

  // ==================== BRANDS ====================
  brands: {
    list: {
      method: 'GET',
      path: '/api/brands',
      query: '?industry=&search=&page=&limit=',
      response: '{ brands[], total, page, totalPages }',
      description: 'List all brands with filtering and pagination',
    },
    getById: {
      method: 'GET',
      path: '/api/brands/:id',
      response: '{ brand, campaigns[] }',
      description: 'Get brand details with campaigns',
    },
    update: {
      method: 'PATCH',
      path: '/api/brands/:id',
      body: '{ companyName?, industry?, website?, description?, budget? }',
      response: '{ brand }',
      description: 'Update brand profile (brand role only)',
    },
  },

  // ==================== INFLUENCERS ====================
  influencers: {
    list: {
      method: 'GET',
      path: '/api/influencers',
      query: '?niche=&platform=&minFollowers=&maxRate=&search=&page=&limit=',
      response: '{ influencers[], total, page, totalPages }',
      description: 'List influencers with filtering and pagination',
    },
    getById: {
      method: 'GET',
      path: '/api/influencers/:id',
      response: '{ influencer, collaborations[] }',
      description: 'Get influencer details with collaboration history',
    },
    aiMatch: {
      method: 'POST',
      path: '/api/influencers/ai-match',
      body: '{ campaignId, criteria }',
      response: '{ matches: { influencer, matchScore, reasons }[] }',
      description: 'AI-powered influencer matching for a campaign',
    },
    update: {
      method: 'PATCH',
      path: '/api/influencers/:id',
      body: '{ displayName?, bio?, niche?, platforms?, pricePerPost? }',
      response: '{ influencer }',
      description: 'Update influencer profile (influencer role only)',
    },
  },

  // ==================== CAMPAIGNS ====================
  campaigns: {
    create: {
      method: 'POST',
      path: '/api/campaigns',
      body: '{ title, description, budget, startDate, endDate, requirements, targetNiche, minFollowers, platforms }',
      response: '{ campaign }',
      description: 'Create a new campaign (brand role only)',
    },
    list: {
      method: 'GET',
      path: '/api/campaigns',
      query: '?status=&niche=&minBudget=&maxBudget=&search=&page=&limit=',
      response: '{ campaigns[], total, page, totalPages }',
      description: 'List campaigns with filtering and pagination',
    },
    getById: {
      method: 'GET',
      path: '/api/campaigns/:id',
      response: '{ campaign, brand, applications[] }',
      description: 'Get campaign details with applications',
    },
    update: {
      method: 'PATCH',
      path: '/api/campaigns/:id',
      body: '{ title?, description?, budget?, status?, requirements? }',
      response: '{ campaign }',
      description: 'Update campaign (brand owner only)',
    },
    delete: {
      method: 'DELETE',
      path: '/api/campaigns/:id',
      description: 'Delete campaign (brand owner only, draft status only)',
    },
  },

  // ==================== APPLICATIONS ====================
  applications: {
    create: {
      method: 'POST',
      path: '/api/applications',
      body: '{ campaignId, proposal, proposedRate }',
      response: '{ application }',
      description: 'Apply to a campaign (influencer role only)',
    },
    list: {
      method: 'GET',
      path: '/api/applications',
      query: '?campaignId=&status=&page=&limit=',
      response: '{ applications[], total }',
      description: 'List applications (filtered by user role)',
    },
    updateStatus: {
      method: 'PATCH',
      path: '/api/applications/:id/status',
      body: '{ status: "accepted" | "rejected" }',
      response: '{ application }',
      description: 'Accept/reject application (brand owner only)',
    },
    withdraw: {
      method: 'POST',
      path: '/api/applications/:id/withdraw',
      response: '{ application }',
      description: 'Withdraw application (influencer owner only)',
    },
  },

  // ==================== COLLABORATIONS ====================
  collaborations: {
    create: {
      method: 'POST',
      path: '/api/collaborations',
      body: '{ applicationId, agreedRate, deliverables, startDate, endDate }',
      response: '{ collaboration }',
      description: 'Create collaboration from accepted application',
    },
    list: {
      method: 'GET',
      path: '/api/collaborations',
      query: '?status=&page=&limit=',
      response: '{ collaborations[], total }',
      description: 'List collaborations (filtered by user role)',
    },
    updateStatus: {
      method: 'PATCH',
      path: '/api/collaborations/:id/status',
      body: '{ status }',
      response: '{ collaboration }',
      description: 'Update collaboration status',
    },
  },

  // ==================== ANALYTICS ====================
  analytics: {
    dashboardStats: {
      method: 'GET',
      path: '/api/analytics/dashboard',
      response: '{ stats: DashboardStats }',
      description: 'Get dashboard statistics based on user role',
    },
    campaignPerformance: {
      method: 'GET',
      path: '/api/analytics/campaigns/:id',
      response: '{ impressions, engagement, conversions, roi }',
      description: 'Get detailed campaign performance metrics',
    },
  },
} as const;

export default API_ROUTES;
