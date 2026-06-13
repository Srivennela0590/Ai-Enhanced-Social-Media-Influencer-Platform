import { create } from 'zustand';
import type { LoginCredentials, RegisterData, AuthState } from '@/types';
import * as authService from '@/services/auth';

// Data schema version — increment this to force a full re-seed
const DATA_VERSION = 7;
const DATA_VERSION_KEY = 'influenceai_data_version';

function checkDataVersion(): boolean {
  const stored = localStorage.getItem(DATA_VERSION_KEY);
  if (stored !== String(DATA_VERSION)) {
    // Wipe all data and re-seed fresh
    const keys = [
      'influenceai_users', 'influenceai_brands', 'influenceai_influencers',
      'influenceai_campaigns', 'influenceai_applications', 'influenceai_collaborations',
      'influenceai_invitations', 'influenceai_token', 'influenceai_user',
    ];
    keys.forEach(k => localStorage.removeItem(k));
    localStorage.setItem(DATA_VERSION_KEY, String(DATA_VERSION));
    return true; // was reset
  }
  return false;
}

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      // Force re-seed if data version changed
      checkDataVersion();

      // Seed demo data on first visit
      await authService.seedDemoData();

      const user = authService.getCurrentUser();
      const token = authService.getToken();

      if (user && token) {
        const payload = authService.verifyToken(token);
        if (payload) {
          set({ user, token, isAuthenticated: true, isLoading: false });
          return;
        }
      }
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authService.login(credentials);
      authService.saveSession(user, token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authService.register(data);
      authService.saveSession(user, token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
