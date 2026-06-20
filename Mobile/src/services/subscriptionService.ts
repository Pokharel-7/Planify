import { api } from './api';

export interface ApiSubscriptionInfo {
  plan: string;
  status: string;
  seats?: number;
  renewsAt?: string;
  price?: number;
  interval?: string;
}

export interface ApiPlan {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  baseCurrency: string;
  features: {
    maxWorkspaces: number;
    maxSpaces: number;
    maxTasks: number;
    hasGroupChat: boolean;
    hasAccessControl: boolean;
  };
}

export interface ApiTransaction {
  _id: string;
  amount: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  planId?: { name: string };
  createdAt: string;
}

export interface EsewaPaymentRequest {
  amount: number;
  tax_amount: number;
  product_service_charge: number;
  product_delivery_charge: number;
  total_amount: number;
  transaction_uuid: string;
  product_code: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

export const subscriptionService = {
  getInfo: () => api.get<{ success: boolean; data: ApiSubscriptionInfo }>('/subscription/info'),
  getPlans: () => api.get<{ success: boolean; data: ApiPlan[] }>('/plans'),
  getTransactions: () => api.get<{ success: boolean; data: ApiTransaction[] }>('/payment/transactions'),
  initiatePayment: (planId: string, memberCount: number = 1, billingCycle: 'monthly' | 'annual' = 'annual') =>
    api.post<{
      success: boolean;
      data: { paymentUrl: string; paymentRequest: EsewaPaymentRequest; transactionUuid: string };
    }>('/payment/initiate', { planId, memberCount, billingCycle }),
  verifyPayment: (data: string) => api.post('/payment/verify', { data }),
};
