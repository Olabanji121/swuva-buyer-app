/**
 * OTP Verification Screen
 *
 * Verifies user email via 6-digit OTP code after registration.
 * Features: auto-focus inputs, countdown timer, resend functionality.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { OTPInput } from '@/components/auth';
import { Button } from '@/components/ui';
import { useVerifyEmailOTP, useRequestOTP } from '@/features/auth';
import { getErrorMessage } from '@/lib/api';

// OTP configuration
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

// Mask email for display (j***@example.com)
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const visibleChars = Math.min(2, localPart.length);
  const masked = localPart.slice(0, visibleChars) + '***';
  return `${masked}@${domain}`;
}

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; name?: string }>();

  // Route params from registration
  const email = params.email || '';
  const name = params.name || '';

  // Form state
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  // TanStack Query mutations
  const verifyOTP = useVerifyEmailOTP();
  const requestOTP = useRequestOTP();

  // Resend timer
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown timer on mount
  useEffect(() => {
    startCountdown();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(RESEND_COOLDOWN);
    setCanResend(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Format countdown as MM:SS
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP change
  const handleOtpChange = useCallback((value: string) => {
    setOtp(value);
    if (error) {
      setError(null);
    }
  }, [error]);

  // Verify OTP
  const handleVerify = useCallback(async () => {
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter the complete verification code');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    verifyOTP.mutate(
      { email, otp },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          AccessibilityInfo.announceForAccessibility('Email verified successfully');
          router.replace('/(tabs)');
        },
        onError: (err) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          const message = getErrorMessage(err);
          setError(message);
          AccessibilityInfo.announceForAccessibility(`Error: ${message}`);
        },
      }
    );
  }, [otp, email, verifyOTP, router]);

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otp.length === OTP_LENGTH && !verifyOTP.isPending && !error) {
      // Small delay for UX
      const timeout = setTimeout(() => {
        handleVerify();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [otp, verifyOTP.isPending, error, handleVerify]);

  // Resend OTP
  const handleResend = useCallback(async () => {
    if (!canResend || requestOTP.isPending) return;

    requestOTP.mutate(
      { email, type: 'email-verification' },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          AccessibilityInfo.announceForAccessibility('Verification code resent');
          startCountdown();
          setOtp('');
          setError(null);
        },
        onError: (err) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Error', getErrorMessage(err));
        },
      }
    );
  }, [canResend, requestOTP, email, startCountdown]);

  // Handle missing email (shouldn't happen, but safety check)
  if (!email) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-7">
        <Text className="text-[#3d405b] text-center">
          Missing email. Please go back and try again.
        </Text>
        <Button
          variant="primary"
          size="md"
          onPress={() => router.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  const isLoading = verifyOTP.isPending;
  const isResending = requestOTP.isPending;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-7 pt-[120px]">
            {/* Header */}
            <View className="items-center mb-16">
              <Text className="text-[28px] font-semibold text-[#3d405b] text-center leading-tight">
                Verify OTP
              </Text>
              <Text className="text-sm text-[#838383] text-center mt-1 px-4">
                Enter your OTP which has been sent to your email and complete verification of your account.
              </Text>
            </View>

            {/* OTP Input Section */}
            <View className="items-center gap-7">
              {/* OTP Input */}
              <OTPInput
                length={OTP_LENGTH}
                value={otp}
                onChange={handleOtpChange}
                error={!!error}
                disabled={isLoading}
                autoFocus
              />

              {/* Error Message */}
              {error && (
                <Text
                  className="text-red-500 text-sm text-center"
                  accessibilityRole="alert"
                >
                  {error}
                </Text>
              )}

              {/* Info Text */}
              <View className="items-center gap-2">
                <Text className="text-sm text-[#a2a5b1] text-center">
                  A code has been sent to {maskEmail(email)}
                </Text>
                <Text className="text-xs text-[#a2a5b1] text-center px-4">
                  Can't find the email? Check your spam or junk folder.
                </Text>

                {/* Resend Timer / Button */}
                {canResend ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={handleResend}
                    disabled={isResending}
                    className="px-0"
                  >
                    {isResending ? 'Sending...' : 'Resend Code'}
                  </Button>
                ) : (
                  <Text className="text-sm font-bold text-[#3d405b]">
                    Resend in {formatCountdown(countdown)}
                  </Text>
                )}
              </View>
            </View>

            {/* Continue Button */}
            <View className="mt-16">
              <Button
                variant="primary"
                size="lg"
                onPress={handleVerify}
                disabled={isLoading || otp.length !== OTP_LENGTH}
                loading={isLoading}
                className="h-[62px]"
              >
                {isLoading ? 'Verifying...' : 'Continue'}
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
