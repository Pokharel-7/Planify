import { api } from './api';

export interface ApiWorkspace {
  _id: string;
  name: string;
  members: Array<{ user: string | { _id: string; name: string; email: string }; role: string }>;
  owner: string | { _id: string; name: string; email: string };
}

export interface ApiSpace {
  _id: string;
  name: string;
  description?: string;
  workspace: string;
  members?: Array<{ user: string | { _id: string; name: string; email: string }; role: string }>;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const workspaceService = {
  getMyWorkspaces: () => api.get<{ success: boolean; count: number; data: ApiWorkspace[] }>('/workspaces'),
  createWorkspace: (name: string) => api.post<{ success: boolean; data: ApiWorkspace }>('/workspaces', { name }),
  getWorkspace: (id: string) => api.get(`/workspaces/${id}`),
  getWorkspaceSpaces: (workspaceId: string) =>
    api.get<{ success: boolean; count: number; data: ApiSpace[] }>(`/workspaces/${workspaceId}/spaces`),
  createSpace: (workspaceId: string, name: string) =>
    api.post<{ success: boolean; data: ApiSpace }>(`/workspaces/${workspaceId}/spaces`, { name }),
  createList: (spaceId: string, name: string) =>
    api.post<{ success: boolean; data: { _id: string; name: string } }>(`/spaces/${spaceId}/lists`, { name }),
  getSpace: (id: string) => api.get<{ success: boolean; data: ApiSpace }>(`/spaces/${id}`),
  getSpaceListsMetadata: (spaceId: string) => api.get(`/spaces/${spaceId}/lists/metadata`),
  getWorkspaceActivity: (workspaceId: string, limit = 5) =>
    api.get(`/workspaces/${workspaceId}/activity`, { params: { limit } }),
};
