import { create } from 'zustand';
import { api } from '../lib/api';
import type { AdminUser, FinancialAnalytics, SystemSettings } from '../types';

interface AdminState {
  users: AdminUser[];
  analytics: FinancialAnalytics | null;
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  updateSubscription: (
    userId: string,
    data: { isPaid?: boolean; planId?: string; status?: string }
  ) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (whatsappContactNumber: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  analytics: null,
  settings: null,
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/super-admin/users');
      set({ users: res.data.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load users', loading: false });
    }
  },

  updateSubscription: async (userId, data) => {
    await api.patch(`/super-admin/users/${userId}/subscription`, data);
    await get().fetchUsers();
  },

  fetchAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/super-admin/analytics');
      set({ analytics: res.data.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load analytics', loading: false });
    }
  },

  fetchSettings: async () => {
    try {
      const res = await api.get('/super-admin/settings');
      set({ settings: res.data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load settings' });
    }
  },

  updateSettings: async (whatsappContactNumber) => {
    const res = await api.put('/super-admin/settings', { whatsappContactNumber });
    set({ settings: res.data.data });
  },
}));
