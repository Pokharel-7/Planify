import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const ROLE_HIERARCHY = { guest: 0, member: 1, admin: 2, owner: 3 } as const;
type Role = keyof typeof ROLE_HIERARCHY;

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  currentWorkspaceId: string | null;
  currentWorkspaceRole: Role | null;
  hasCompletedOnboarding: boolean;

  setSession: (user: AuthUser, token: string) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  setWorkspaceContext: (workspaceId: string, role: Role) => void;
  clearSession: () => void;
  completeOnboarding: () => void;

  hasMinRole: (minRole: Role) => boolean;
  isOwner: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      currentWorkspaceId: null,
      currentWorkspaceRole: null,
      hasCompletedOnboarding: false,

      setSession: (user, token) => set({ user, token }),
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : state.user })),
      setWorkspaceContext: (workspaceId, role) =>
        set({ currentWorkspaceId: workspaceId, currentWorkspaceRole: role }),
      clearSession: () =>
        set({ user: null, token: null, currentWorkspaceId: null, currentWorkspaceRole: null }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      hasMinRole: (minRole) => {
        const role = get().currentWorkspaceRole;
        if (!role) return false;
        return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
      },
      isOwner: () => get().currentWorkspaceRole === 'owner',
      isAdmin: () => get().hasMinRole('admin'),
    }),
    {
      name: 'planify-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

