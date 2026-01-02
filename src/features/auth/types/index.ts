/**
 * Auth Feature Types
 *
 * TypeScript types for authentication flows.
 */

// User roles
export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

// User from API
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Session from API
export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  token: string;
}

// Auth session response (from get-session)
export interface AuthSession {
  user: User;
  session: Session;
}

// Sign Up
export interface SignUpInput {
  email: string;
  password: string;
  name: string;
}

export interface SignUpResponse {
  user: User;
  session: Session;
}

// Sign In
export interface SignInInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignInResponse {
  user: User;
  session: Session;
}

// OTP Types
export type OTPType = 'email-verification' | 'sign-in' | 'forget-password';

// Request OTP
export interface RequestOTPInput {
  email: string;
  type: OTPType;
}

export interface RequestOTPResponse {
  success: boolean;
  message: string;
}

// Verify OTP
export interface VerifyOTPInput {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  user: User;
  session: Session;
}

// Password Reset
export interface ForgotPasswordInput {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Error response
export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}
