/**
 * Auth Service
 *
 * Handles all authentication API calls to the Swuva backend.
 * Uses Better Auth endpoints.
 */

import { api } from '@/lib/api';
import type {
  SignUpInput,
  SignUpResponse,
  SignInInput,
  SignInResponse,
  AuthSession,
  RequestOTPInput,
  RequestOTPResponse,
  VerifyOTPInput,
  VerifyOTPResponse,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
} from '../types';

/**
 * Auth Service
 *
 * All methods return the data directly (unwrapped from response).
 * Errors are thrown and should be caught by TanStack Query.
 */
export const authService = {
  /**
   * Sign up with email and password
   * Creates account and sends verification OTP
   */
  signUp: async (input: SignUpInput): Promise<SignUpResponse> => {
    const { data } = await api.post<SignUpResponse>('/auth/sign-up/email', input);
    return data;
  },

  /**
   * Sign in with email and password
   */
  signIn: async (input: SignInInput): Promise<SignInResponse> => {
    const { data } = await api.post<SignInResponse>('/auth/sign-in/email', input);
    return data;
  },

  /**
   * Sign out - invalidates current session
   */
  signOut: async (): Promise<void> => {
    await api.post('/auth/sign-out');
  },

  /**
   * Get current session
   * Returns null if not authenticated
   */
  getSession: async (): Promise<AuthSession | null> => {
    try {
      const { data } = await api.get<AuthSession>('/auth/get-session');
      return data;
    } catch (error) {
      // 401 means no valid session
      return null;
    }
  },

  /**
   * Request OTP for email verification, sign-in, or password reset
   */
  requestOTP: async (input: RequestOTPInput): Promise<RequestOTPResponse> => {
    const { data } = await api.post<RequestOTPResponse>(
      '/auth/email-otp/send-verification-otp',
      input
    );
    return data;
  },

  /**
   * Verify email with OTP code
   * Returns authenticated session on success
   */
  verifyEmailOTP: async (input: VerifyOTPInput): Promise<VerifyOTPResponse> => {
    const { data } = await api.post<VerifyOTPResponse>(
      '/auth/email-otp/verify-email',
      input
    );
    return data;
  },

  /**
   * Sign in with OTP (passwordless)
   */
  signInWithOTP: async (input: VerifyOTPInput): Promise<VerifyOTPResponse> => {
    const { data } = await api.post<VerifyOTPResponse>(
      '/auth/sign-in/email-otp',
      input
    );
    return data;
  },

  /**
   * Request password reset OTP via email
   * Uses emailOTP plugin endpoint
   */
  forgotPassword: async (input: ForgotPasswordInput): Promise<ForgotPasswordResponse> => {
    const { data } = await api.post<ForgotPasswordResponse>(
      '/auth/forget-password/email-otp',
      input
    );
    return data;
  },

  /**
   * Reset password with OTP
   * Uses emailOTP plugin endpoint
   * Note: Backend expects 'password' but we use 'newPassword' for clarity
   */
  resetPassword: async (input: ResetPasswordInput): Promise<ResetPasswordResponse> => {
    const { email, otp, newPassword } = input;
    const { data } = await api.post<ResetPasswordResponse>(
      '/auth/email-otp/reset-password',
      { email, otp, password: newPassword }
    );
    return data;
  },

  /**
   * Resend verification email (link-based)
   */
  resendVerificationEmail: async (email: string): Promise<void> => {
    await api.post('/auth/send-verification-email', { email });
  },
};

export default authService;
