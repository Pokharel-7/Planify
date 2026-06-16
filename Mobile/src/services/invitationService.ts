import { api } from './api';

export interface ApiInvitation {
  _id: string;
  email: string;
  workspaceId: { _id: string; name: string } | string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: { _id: string; name: string; email: string };
  token: string;
  createdAt: string;
  expiresAt: string;
}

export const invitationService = {
  sendInvite: (workspaceId: string, email: string, role: 'admin' | 'member' = 'member') =>
    api.post(`/workspaces/${workspaceId}/invites`, { email, role }),

  getWorkspaceInvitations: (workspaceId: string) =>
    api.get<{ success: boolean; count: number; data: ApiInvitation[] }>(`/workspaces/${workspaceId}/invites`),

  getMyInvitations: () => api.get<{ success: boolean; count: number; data: ApiInvitation[] }>('/invites/my-invitations'),

  acceptInvite: (token: string) => api.post(`/invites/accept/${token}`),
};