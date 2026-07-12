export interface User {
  _id: string;
  name: string;
  email: string;
  isSuperUser?: boolean;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  workspaceCount: number;
  subscription: {
    planId: string | null;
    planName: string;
    planPrice: number;
    planBaseCurrency: string;
    isPaid: boolean;
    status: 'free' | 'active' | 'expired';
    expiresAt?: string;
    daysRemaining?: number;
  };
  createdAt: string;
}

export interface FinancialAnalytics {
  totalRevenue: number;
  revenueBaseCurrency: string;
  conversionRate: number;
  signupData: { week: string; count: number; year: number }[];
  metrics: {
    totalUsers: number;
    paidUsers: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
  };
}

export interface SystemSettings {
  _id: string;
  whatsappContactNumber: string;
}

export interface Workspace {
  _id: string;
  name: string;
  logo?: string | null;
  owner: string;
  createdAt: string;
}

export type MemberRole = 'owner' | 'admin' | 'member' | 'guest';

export interface Member {
  _id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: 'active' | 'inactive';
  isOwner: boolean;
  customRoleTitle?: string | null;
}

export interface Invitation {
  _id: string;
  email: string;
  workspaceId: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: { _id: string; name: string; email: string };
  createdAt: string;
  expiresAt: string;
}
