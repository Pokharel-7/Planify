import { api } from './api';

export interface ApiNotification {
  _id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export const notificationService = {
  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get<{ success: boolean; data: ApiNotification[]; pagination: any }>('/notifications', { params }),
  getUnreadCount: () => api.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};
