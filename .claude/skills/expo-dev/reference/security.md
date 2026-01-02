# Security Implementation Guide

## Secure Storage

Use `expo-secure-store` for all sensitive data:

```tsx
// src/lib/storage.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = {
  ACCESS_TOKEN: 'swuva_access_token',
  REFRESH_TOKEN: 'swuva_refresh_token',
  USER_ID: 'swuva_user_id',
  BIOMETRIC_ENABLED: 'swuva_biometric_enabled',
} as const;

class SecureStorage {
  async setToken(key: keyof typeof KEYS, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      console.warn('Secure storage not available on web');
      return;
    }
    await SecureStore.setItemAsync(KEYS[key], value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async getToken(key: keyof typeof KEYS): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    return SecureStore.getItemAsync(KEYS[key]);
  }

  async removeToken(key: keyof typeof KEYS): Promise<void> {
    if (Platform.OS === 'web') return;
    await SecureStore.deleteItemAsync(KEYS[key]);
  }

  async clearAll(): Promise<void> {
    await Promise.all(
      Object.keys(KEYS).map(key => this.removeToken(key as keyof typeof KEYS))
    );
  }
}

export const secureStorage = new SecureStorage();
```

## Biometric Authentication

```tsx
// src/features/auth/hooks/useBiometric.ts
import { useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { secureStorage } from '@/lib/storage';

export function useBiometric() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const checkAvailability = useCallback(async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsAvailable(compatible && enrolled);

    const enabled = await secureStorage.getToken('BIOMETRIC_ENABLED');
    setIsEnabled(enabled === 'true');

    return compatible && enrolled;
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access Swuva',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });

    return result.success;
  }, [isAvailable]);

  const enableBiometric = useCallback(async () => {
    const success = await authenticate();
    if (success) {
      await secureStorage.setToken('BIOMETRIC_ENABLED', 'true');
      setIsEnabled(true);
    }
    return success;
  }, [authenticate]);

  const disableBiometric = useCallback(async () => {
    await secureStorage.removeToken('BIOMETRIC_ENABLED');
    setIsEnabled(false);
  }, []);

  return {
    isAvailable,
    isEnabled,
    checkAvailability,
    authenticate,
    enableBiometric,
    disableBiometric,
  };
}
```

## API Client with Token Refresh

```tsx
// src/lib/api.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { secureStorage } from './storage';
import { useAuthStore } from '@/stores/auth.store';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.swuva.com';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await secureStorage.getToken('ACCESS_TOKEN');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await secureStorage.getToken('REFRESH_TOKEN');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        await secureStorage.setToken('ACCESS_TOKEN', accessToken);
        await secureStorage.setToken('REFRESH_TOKEN', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
```

## Auth Store

```tsx
// src/stores/auth.store.ts
import { create } from 'zustand';
import { secureStorage } from '@/lib/storage';
import { router } from 'expo-router';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  logout: async () => {
    await secureStorage.clearAll();
    set({ user: null, isAuthenticated: false });
    router.replace('/(auth)/sign-in');
  },

  checkAuth: async () => {
    const token = await secureStorage.getToken('ACCESS_TOKEN');
    if (!token) {
      set({ isLoading: false });
      return false;
    }
    // Validate token with API if needed
    set({ isLoading: false, isAuthenticated: true });
    return true;
  },
}));
```

## Security Checklist

Before each release:

- [ ] All tokens stored with `expo-secure-store`
- [ ] No hardcoded secrets in code
- [ ] Environment variables in app.config.ts (not .env in bundle)
- [ ] All API calls use HTTPS
- [ ] Deep links validated before navigation
- [ ] User inputs sanitized
- [ ] Session timeout implemented
- [ ] Logout clears all sensitive data
- [ ] ProGuard enabled for Android
- [ ] Hermes bytecode enabled
- [ ] Debug logging disabled in production
- [ ] Certificate pinning for production (optional)

## Deep Link Validation

```tsx
// app/_layout.tsx
import { useEffect } from 'react';
import { Linking } from 'react-native';

const ALLOWED_HOSTS = ['swuva.com', 'app.swuva.com'];

export default function RootLayout() {
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      try {
        const parsed = new URL(url);
        if (!ALLOWED_HOSTS.includes(parsed.host)) {
          console.warn('Blocked deep link from unknown host:', parsed.host);
          return;
        }
        // Handle valid deep link
      } catch {
        console.warn('Invalid deep link URL:', url);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  return <Stack />;
}
```

## Input Sanitization

```tsx
// src/lib/validation.ts
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Sanitize string inputs
export const sanitizeString = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

// Common validation schemas
export const emailSchema = z.string().email().transform(sanitizeString);
export const nameSchema = z.string().min(2).max(100).transform(sanitizeString);
export const searchSchema = z.string().max(200).transform(sanitizeString);
```
