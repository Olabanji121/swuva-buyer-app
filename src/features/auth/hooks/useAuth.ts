/**
 * Auth Hooks
 *
 * TanStack Query hooks for authentication operations.
 * Provides caching, optimistic updates, and error handling.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/stores';
import { authService } from '../services/auth.service';
import type {
  SignUpInput,
  SignInInput,
  RequestOTPInput,
  VerifyOTPInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  AuthSession,
  User,
} from '../types';

// Query keys factory
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

/**
 * Get current session
 * Automatically syncs with Zustand auth store
 */
export function useSession() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  return useQuery({
    queryKey: authKeys.session(),
    queryFn: authService.getSession,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: false,
    // Sync session with Zustand store
    select: (data: AuthSession | null) => {
      if (data?.user && data?.session) {
        setAuth(
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
          },
          data.session.token
        );
      }
      return data;
    },
  });
}

/**
 * Sign up mutation
 */
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignUpInput) => authService.signUp(input),
    onSuccess: async (data) => {
      // Store token securely
      if (data.session?.token) {
        await SecureStore.setItemAsync('swuva-auth-token', data.session.token);
      }
      // Invalidate session query to refetch
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}

/**
 * Sign in mutation
 */
export function useSignIn() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (input: SignInInput) => authService.signIn(input),
    onSuccess: async (data) => {
      // Store token securely
      if (data.session?.token) {
        await SecureStore.setItemAsync('swuva-auth-token', data.session.token);
      }
      // Update auth store
      if (data.user) {
        setAuth(
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
          },
          data.session?.token || ''
        );
      }
      // Invalidate session query to fetch full user data including role
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}

/**
 * Sign out mutation
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: async () => {
      // Clear stored token
      await SecureStore.deleteItemAsync('swuva-auth-token');
      // Clear auth store
      logout();
      // Clear all auth queries
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
    // Even if API fails, clear local state
    onError: async () => {
      await SecureStore.deleteItemAsync('swuva-auth-token');
      logout();
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

/**
 * Request OTP mutation
 */
export function useRequestOTP() {
  return useMutation({
    mutationFn: (input: RequestOTPInput) => authService.requestOTP(input),
  });
}

/**
 * Verify email OTP mutation
 */
export function useVerifyEmailOTP() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (input: VerifyOTPInput) => authService.verifyEmailOTP(input),
    onSuccess: async (data) => {
      // Store token securely
      if (data.session?.token) {
        await SecureStore.setItemAsync('swuva-auth-token', data.session.token);
      }
      // Update auth store
      if (data.user) {
        setAuth(
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
          },
          data.session?.token || ''
        );
      }
      // Invalidate session query
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}

/**
 * Sign in with OTP mutation (passwordless)
 */
export function useSignInWithOTP() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (input: VerifyOTPInput) => authService.signInWithOTP(input),
    onSuccess: async (data) => {
      if (data.session?.token) {
        await SecureStore.setItemAsync('swuva-auth-token', data.session.token);
      }
      if (data.user) {
        setAuth(
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
          },
          data.session?.token || ''
        );
      }
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}

/**
 * Forgot password mutation
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authService.forgotPassword(input),
  });
}

/**
 * Reset password mutation
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => authService.resetPassword(input),
  });
}
