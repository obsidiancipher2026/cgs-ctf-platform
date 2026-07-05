// Cookie helpers
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

import { create } from 'zustand';
import { api } from './api';

interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  role: string;
  score: number;
  ranking: number;
  team_id: number | null;
}

interface AppState {
  user: User | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User) => void;
  setCsrfToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  refreshUser: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  csrfToken: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },
  setCsrfToken: (token) => {
    set({ csrfToken: token });
  },
  logout: () => {
    set({ user: null, csrfToken: null, isAuthenticated: false, isLoading: false });
    api.logout().catch(() => {});
  },
  setLoading: (loading) => set({ isLoading: loading }),
  refreshUser: async () => {
    try {
      const user = await api.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, csrfToken: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export const initAuth = () => {
  const csrfCookie = getCookie('csrf_token');
  if (csrfCookie) useStore.getState().setCsrfToken(csrfCookie);
  useStore.getState().refreshUser().finally(() => {
    useStore.getState().setLoading(false);
  });
};
