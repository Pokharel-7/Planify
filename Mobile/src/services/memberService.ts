import { api } from './api';

export interface ApiMember {
  user: { _id: string; name: string; email: string; avatar?: string };
  role: string;
  status?: string;
}

export const memberService = {
  getWorkspaceMembers: (workspaceId: string) =>
    api.get<{ success: boolean; data: { members: ApiMember[] } | ApiMember[] }>(`/workspaces/${workspaceId}/members`),
  inviteMember: (workspaceId: string, email: string, role: string = 'member') =>
    api.post(`/workspaces/${workspaceId}/members/invite`, { email, role }),
  updateMyStatus: (workspaceId: string, status: 'active' | 'inactive') =>
    api.patch(`/workspaces/${workspaceId}/members/me/status`, { status }),
};
