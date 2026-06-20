import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/useAuthStore';

// Configure this in app.json -> expo.extra.apiUrl, or override with EXPO_PUBLIC_API_URL
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
  'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/google', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-otp'];

api.interceptors.request.use((config) => {
  const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => config.url?.includes(path));
  if (!isAuthEndpoint) {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  }
);
