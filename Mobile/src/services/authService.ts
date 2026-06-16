import { api } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  login: (payload: LoginPayload) => api.post('/auth/login', payload),
  register: (payload: RegisterPayload) => api.post('/auth/register', payload),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (email: string, otp: string, password: string) =>
    api.post('/auth/reset-password', { email, otp, password }),
  resendOtp: (email: string) => api.post('/auth/resend-otp', { email }),
  googleAuth: (idToken: string) => api.post('/auth/google', { idToken }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; jobTitle?: string; department?: string; bio?: string; profilePicture?: string }) =>
    api.patch('/auth/me', data),
};

