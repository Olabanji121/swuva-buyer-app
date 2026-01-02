/**
 * Auth Feature
 *
 * Exports all auth-related hooks, services, and types.
 */

// Hooks
export {
  useSession,
  useSignUp,
  useSignIn,
  useSignOut,
  useRequestOTP,
  useVerifyEmailOTP,
  useSignInWithOTP,
  useForgotPassword,
  useResetPassword,
  authKeys,
} from './hooks/useAuth';

// Service
export { authService } from './services/auth.service';

// Types
export type {
  User,
  UserRole,
  Session,
  AuthSession,
  SignUpInput,
  SignUpResponse,
  SignInInput,
  SignInResponse,
  RequestOTPInput,
  RequestOTPResponse,
  VerifyOTPInput,
  VerifyOTPResponse,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
  OTPType,
  AuthError,
} from './types';
