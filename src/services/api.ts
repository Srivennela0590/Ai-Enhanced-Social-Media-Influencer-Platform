// ============================================================
// API Client — Connects frontend to Express backend
// ============================================================
// When VITE_API_URL is set, all data operations go through
// the REST API. When not set, falls back to localStorage (db.ts).
// ============================================================

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

export function isBackendMode(): boolean {
  return !!API_BASE;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = localStorage.getItem('influenceai_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

// ── Auth API ─────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; data: { user: any; accessToken: string; refreshToken: string } }>('/api/auth/login', { email, password }),
  register: (data: any) =>
    api.post<{ success: boolean; data: { user: any; accessToken: string; refreshToken: string } }>('/api/auth/register', data),
  me: () => api.get<{ success: boolean; data: { user: any } }>('/api/auth/me'),
  refresh: (refreshToken: string) =>
    api.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>('/api/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/api/auth/reset-password', { token, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/api/auth/change-password', { currentPassword, newPassword }),
};

// ── Campaign API ─────────────────────────────────────────────
export const campaignApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<{ success: boolean; data: any[]; pagination: any }>(`/api/campaigns${query}`);
  },
  get: (id: string) => api.get<{ success: boolean; data: any }>(`/api/campaigns/${id}`),
  create: (data: any) => api.post<{ success: boolean; data: any }>('/api/campaigns', data),
  update: (id: string, data: any) => api.patch<{ success: boolean; data: any }>(`/api/campaigns/${id}`, data),
  delete: (id: string) => api.delete(`/api/campaigns/${id}`),
};

// ── Application API ──────────────────────────────────────────
export const applicationApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<{ success: boolean; data: any[] }>(`/api/applications${query}`);
  },
  create: (data: any) => api.post<{ success: boolean; data: any }>('/api/applications', data),
  updateStatus: (id: string, status: string) => api.patch(`/api/applications/${id}/status`, { status }),
  withdraw: (id: string) => api.post(`/api/applications/${id}/withdraw`),
};

// ── Invitation API ───────────────────────────────────────────
export const invitationApi = {
  list: () => api.get<{ success: boolean; data: any[] }>('/api/invitations'),
  create: (data: any) => api.post('/api/invitations', data),
  updateStatus: (id: string, status: string) => api.patch(`/api/invitations/${id}/status`, { status }),
};

// ── Collaboration API ────────────────────────────────────────
export const collaborationApi = {
  list: () => api.get<{ success: boolean; data: any[] }>('/api/collaborations'),
  updateStatus: (id: string, status: string) => api.patch(`/api/collaborations/${id}/status`, { status }),
};

// ── Influencer API ───────────────────────────────────────────
export const influencerApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<{ success: boolean; data: any[]; pagination: any }>(`/api/influencers${query}`);
  },
  get: (id: string) => api.get<{ success: boolean; data: any }>(`/api/influencers/${id}`),
  updateProfile: (data: any) => api.patch('/api/influencers/profile', data),
};

// ── Review API ───────────────────────────────────────────────
export const reviewApi = {
  list: (userId: string) => api.get<{ success: boolean; data: any[] }>(`/api/reviews/${userId}`),
  create: (data: any) => api.post('/api/reviews', data),
};

// ── Payment API ──────────────────────────────────────────────
export const paymentApi = {
  list: () => api.get<{ success: boolean; data: any[] }>('/api/payments'),
  create: (data: any) => api.post('/api/payments', data),
};

// ── Notification API ─────────────────────────────────────────
export const notificationApi = {
  list: () => api.get<{ success: boolean; data: any[]; unreadCount: number }>('/api/notifications'),
  markRead: (id: string) => api.patch(`/api/notifications/${id}/read`),
  markAllRead: () => api.post('/api/notifications/read-all'),
};

// ── Message API ──────────────────────────────────────────────
export const messageApi = {
  conversations: () => api.get<{ success: boolean; data: any[] }>('/api/messages/conversations'),
  messages: (conversationId: string) => api.get<{ success: boolean; data: any[] }>(`/api/messages/${conversationId}`),
  send: (data: any) => api.post('/api/messages', data),
  markRead: (conversationId: string) => api.post(`/api/messages/${conversationId}/read`),
};

// ── Analytics API ────────────────────────────────────────────
export const analyticsApi = {
  dashboard: () => api.get<{ success: boolean; data: any }>('/api/analytics/dashboard'),
};

// ── Upload API ───────────────────────────────────────────────
export const uploadApi = {
  image: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('influenceai_token');
    const res = await fetch(`${API_BASE}/api/uploads/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  },
};

// ── ML API ───────────────────────────────────────────────────
export const mlApi = {
  predict: (data: any) => api.post<{ success: boolean; data: any }>('/api/ml/predict', data),
};

// ── AI API ───────────────────────────────────────────────────
export const aiApi = {
  caption: (data: any) => api.post<{ success: boolean; data: any }>('/api/ai/caption', data),
  proposal: (data: any) => api.post<{ success: boolean; data: any }>('/api/ai/proposal', data),
  outreach: (data: any) => api.post<{ success: boolean; data: any }>('/api/ai/outreach', data),
};

// ── Admin API ────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get<{ success: boolean; data: any }>('/api/admin/stats'),
  users: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<{ success: boolean; data: any[] }>(`/api/admin/users${query}`);
  },
  toggleUser: (id: string, isActive: boolean) => api.patch(`/api/admin/users/${id}/status`, { isActive }),
  campaigns: () => api.get<{ success: boolean; data: any[] }>('/api/admin/campaigns'),
  reviews: () => api.get<{ success: boolean; data: any[] }>('/api/admin/reviews'),
  approveReview: (id: string, isApproved: boolean) => api.patch(`/api/admin/reviews/${id}/approve`, { isApproved }),
  payments: () => api.get<{ success: boolean; data: any[] }>('/api/admin/payments'),
};
