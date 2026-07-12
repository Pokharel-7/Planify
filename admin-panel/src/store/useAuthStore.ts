import { create } from 'zustand';
import { api } from '../lib/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  hydrate: () => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (token && userRaw) {
      set({ token, user: JSON.parse(userRaw) });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      if (!user.isSuperUser) {
        set({ loading: false, error: 'This account does not have Super Admin access.' });
        throw new Error('NOT_SUPER_ADMIN');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, loading: false });
    } catch (err: any) {
      if (err.message === 'NOT_SUPER_ADMIN') throw err;
      const code = err.response?.data?.code;
      const message =
        code === 'NOT_VERIFIED'
          ? 'Please verify your email before logging in.'
          : err.response?.data?.message || 'Could not log in. Check your credentials.';
      set({ error: message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
}));
