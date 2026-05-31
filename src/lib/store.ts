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
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },
  setCsrfToken: (token) => {
    localStorage.setItem('csrf_token', token);
    set({ csrfToken: token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('csrf_token');
    set({ user: null, csrfToken: null, isAuthenticated: false, isLoading: false });
    api.logout().catch(() => {});
  },
  setLoading: (loading) => set({ isLoading: loading }),
  refreshUser: async () => {
    try {
      const user = await api.getMe();
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('csrf_token');
      set({ user: null, csrfToken: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export const initAuth = () => {
  const userStr = localStorage.getItem('user');
  const csrfStr = localStorage.getItem('csrf_token');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (csrfStr) useStore.getState().setCsrfToken(csrfStr);
      useStore.getState().setAuth(user);
      useStore.getState().refreshUser();
    } catch {
      useStore.getState().setLoading(false);
    }
  } else {
    useStore.getState().setLoading(false);
  }
};
