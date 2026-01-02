/**
 * API Client
 *
 * Centralized Axios instance with interceptors for auth, error handling,
 * and request/response transformation.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// API base URL - use environment variable or default
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:7079/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Send cookies for session-based auth
  withCredentials: true,
});

// Request interceptor - add auth token if available
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log('[API] Request:', config.method?.toUpperCase(), config.url);

    // For mobile, we might need to manually attach the token
    // since cookies don't work the same as web
    try {
      const token = await SecureStore.getItemAsync('swuva-auth-token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // SecureStore might fail on some platforms
      console.warn('[API] Failed to get auth token:', error);
    }

    // Add platform info for analytics/debugging
    config.headers['X-Platform'] = Platform.OS;
    config.headers['X-App-Version'] = process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0';

    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config;

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      // Clear stored auth data
      try {
        await SecureStore.deleteItemAsync('swuva-auth-token');
        await SecureStore.deleteItemAsync('swuva-auth');
      } catch (e) {
        // Ignore SecureStore errors
      }

      // The auth store will handle redirecting to login
      // via its subscription or the app's auth guard
    }

    // Transform error to a consistent format
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(apiError);
  }
);

// Error types
export interface ApiError {
  message: string;
  code: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// Success response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Helper to check if error is an ApiError
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
}

// Helper to get user-friendly error message
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export default api;
