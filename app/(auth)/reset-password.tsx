/**
 * Reset Password Screen
 *
 * Allows users to enter OTP and set a new password.
 * Implements best practices for validation, accessibility, and UX.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  AccessibilityInfo,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AuthInput, OTPInput } from '@/components/auth';
import { Button } from '@/components/ui';
import { useResetPassword, useForgotPassword } from '@/features/auth';
import { getErrorMessage } from '@/lib/api';
import { validatePassword, PASSWORD_MIN_LENGTH } from '@/utils/validation';

// OTP configuration
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email || '';

  const resetPassword = useResetPassword();
  const forgotPassword = useForgotPassword();

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Form state
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    otp?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Track touched fields for validation timing
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  // Resend timer
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Password input ref
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Start countdown on mount
  useEffect(() => {
    startCountdown();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(RESEND_COOLDOWN);
    setCanResend(false);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP change
  const handleOtpChange = useCallback((value: string) => {
    setOtp(value);
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: undefined }));
    }
  }, [errors.otp]);

  // Handle password change with real-time validation
  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);

    // Validate while typing if field was touched
    if (touched.password) {
      if (!text) {
        setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      } else if (!validatePassword(text)) {
        setErrors((prev) => ({ ...prev, password: `At least ${PASSWORD_MIN_LENGTH} characters` }));
      } else {
        setErrors((prev) => ({ ...prev, password: undefined }));
      }
    }

    // Also check confirm password match
    if (touched.confirmPassword && confirmPassword && text !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (touched.confirmPassword && text === confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  }, [touched.password, touched.confirmPassword, confirmPassword]);

  // Handle confirm password change with real-time validation
  const handleConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text);

    if (touched.confirmPassword) {
      if (!text) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      } else if (password !== text) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    }
  }, [touched.confirmPassword, password]);

  // Blur handlers for validation
  const handlePasswordBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, password: true }));

    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
    } else if (!validatePassword(password)) {
      setErrors((prev) => ({ ...prev, password: `At least ${PASSWORD_MIN_LENGTH} characters` }));
    } else {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  }, [password]);

  const handleConfirmPasswordBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, confirmPassword: true }));

    if (!confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Please confirm your password' }));
    } else if (password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  }, [confirmPassword, password]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: typeof errors = {};

    if (otp.length !== OTP_LENGTH) {
      newErrors.otp = 'Please enter the complete reset code';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = `At least ${PASSWORD_MIN_LENGTH} characters`;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [otp, password, confirmPassword]);

  const handleSubmit = useCallback(() => {
    Keyboard.dismiss();

    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    resetPassword.mutate(
      { email, otp, newPassword: password },
      {
        onSuccess: () => {
          if (!isMountedRef.current) return;

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          AccessibilityInfo.announceForAccessibility('Password reset successful');
          Alert.alert(
            'Password Reset',
            'Your password has been reset successfully. Please login with your new password.',
            [
              {
                text: 'Login',
                onPress: () => router.replace('/(auth)/login'),
              },
            ]
          );
        },
        onError: (err) => {
          if (!isMountedRef.current) return;

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          const message = getErrorMessage(err);

          // Check for rate limiting
          if (message.toLowerCase().includes('rate') || message.toLowerCase().includes('too many')) {
            Alert.alert(
              'Too Many Attempts',
              'Please wait a while before trying again.',
              [{ text: 'OK' }]
            );
            return;
          }

          // Check for OTP errors
          if (message.toLowerCase().includes('otp') || message.toLowerCase().includes('code') || message.toLowerCase().includes('invalid')) {
            setErrors((prev) => ({ ...prev, otp: 'Invalid or expired code' }));
          } else if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connection')) {
            Alert.alert(
              'Connection Error',
              'Unable to connect. Please check your internet and try again.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Retry', onPress: handleSubmit },
              ]
            );
          } else {
            Alert.alert('Error', message);
          }
        },
      }
    );
  }, [email, otp, password, validateForm, resetPassword, router]);

  const handleResend = useCallback(() => {
    if (!canResend || forgotPassword.isPending) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    forgotPassword.mutate(
      { email },
      {
        onSuccess: () => {
          if (!isMountedRef.current) return;

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          AccessibilityInfo.announceForAccessibility('Reset code resent');
          startCountdown();
          setOtp('');
          setErrors({});
        },
        onError: (err) => {
          if (!isMountedRef.current) return;

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          const message = getErrorMessage(err);

          if (message.toLowerCase().includes('rate') || message.toLowerCase().includes('too many')) {
            Alert.alert(
              'Too Many Attempts',
              'Please wait a while before requesting another code.',
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert('Error', message);
          }
        },
      }
    );
  }, [canResend, forgotPassword, email, startCountdown]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  // Handle missing email
  if (!email) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-7">
        <Ionicons name="alert-circle-outline" size={48} color="#838383" />
        <Text className="text-[#3d405b] text-center mt-4">
          Missing email. Please go back and try again.
        </Text>
        <Button
          variant="primary"
          size="md"
          onPress={() => router.replace('/(auth)/forgot-password')}
          className="mt-6"
        >
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  const isLoading = resetPassword.isPending;
  const isResending = forgotPassword.isPending;
  const canSubmit = otp.length === OTP_LENGTH && password && confirmPassword && !isLoading;

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
          <View className="flex-1 px-7 pt-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onPress={handleBack}
              className="self-start -ml-2 mb-6"
              accessibilityLabel="Go back"
              accessibilityHint="Returns to the previous screen"
            >
              <View className="flex-row items-center">
                <Ionicons name="chevron-back" size={24} color="#3d405b" />
                <Text className="text-[#3d405b] font-medium ml-1">Back</Text>
              </View>
            </Button>

            {/* Header */}
            <View className="items-center mb-8">
              <Text
                className="text-[28px] font-semibold text-[#3d405b] text-center leading-tight"
                accessibilityRole="header"
              >
                Verify OTP
              </Text>
              <Text className="text-sm text-[#838383] text-center mt-2 px-4">
                Enter your OTP which has been sent to your email and set a new password.
              </Text>
            </View>

            {/* OTP Input */}
            <View className="items-center mb-6">
              <OTPInput
                length={OTP_LENGTH}
                value={otp}
                onChange={handleOtpChange}
                error={!!errors.otp}
                disabled={isLoading}
                autoFocus
              />
              {errors.otp && (
                <Text className="text-red-500 text-sm mt-2" accessibilityRole="alert">
                  {errors.otp}
                </Text>
              )}

              {/* Resend */}
              <View className="mt-3">
                {canResend ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={handleResend}
                    disabled={isResending}
                    accessibilityLabel="Resend verification code"
                  >
                    {isResending ? 'Sending...' : 'Resend Code'}
                  </Button>
                ) : (
                  <Text className="text-sm text-[#838383]">
                    Resend in {formatCountdown(countdown)}
                  </Text>
                )}
              </View>

              <Text className="text-sm text-[#838383] text-center mt-2">
                A code has been sent to your email
              </Text>
            </View>

            {/* Password Fields */}
            <View className="gap-5">
              <AuthInput
                ref={passwordRef}
                label="New Password"
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={handlePasswordBlur}
                error={errors.password}
                isPassword
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                editable={!isLoading}
              />

              <AuthInput
                ref={confirmPasswordRef}
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                onBlur={handleConfirmPasswordBlur}
                error={errors.confirmPassword}
                isPassword
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                editable={!isLoading}
              />
            </View>

            {/* Submit Button */}
            <View className="mt-8">
              <Button
                variant="primary"
                size="lg"
                onPress={handleSubmit}
                disabled={!canSubmit}
                loading={isLoading}
                className="h-[62px]"
                accessibilityLabel={isLoading ? 'Resetting password' : 'Reset password'}
                accessibilityState={{ disabled: !canSubmit }}
              >
                Continue
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
