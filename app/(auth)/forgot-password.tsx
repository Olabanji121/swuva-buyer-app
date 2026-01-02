/**
 * Forgot Password Screen
 *
 * Allows users to request a password reset OTP via email.
 * Implements best practices for validation, accessibility, and UX.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AuthInput } from '@/components/auth';
import { Button } from '@/components/ui';
import { useForgotPassword } from '@/features/auth';
import { getErrorMessage } from '@/lib/api';
import { validateEmail, sanitizeEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const forgotPassword = useForgotPassword();

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Form state
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Handle email change - no dependency on error to prevent recreation
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    // Clear error when user starts typing (if field was touched)
    if (touched) {
      const trimmed = text.trim();
      if (trimmed && validateEmail(trimmed)) {
        setError(null);
      }
    }
  }, [touched]);

  // Validate on blur for immediate feedback
  const handleEmailBlur = useCallback(() => {
    setTouched(true);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Email is required');
    } else if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email');
    } else {
      setError(null);
    }
  }, [email]);

  // Validate form - takes email as parameter to avoid recreation
  const validateForm = useCallback((emailToValidate: string): boolean => {
    const trimmedEmail = emailToValidate.trim();

    if (!trimmedEmail) {
      setError('Email is required');
      return false;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email');
      return false;
    }

    return true;
  }, []);

  const handleSubmit = useCallback(() => {
    // Dismiss keyboard first
    Keyboard.dismiss();

    if (!validateForm(email)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const sanitizedEmail = sanitizeEmail(email);

    forgotPassword.mutate(
      { email: sanitizedEmail },
      {
        onSuccess: () => {
          if (!isMountedRef.current) return;

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.push({
            pathname: '/(auth)/reset-password',
            params: { email: sanitizedEmail },
          });
        },
        onError: (err) => {
          if (!isMountedRef.current) return;

          const message = getErrorMessage(err);

          // Check for rate limiting
          if (message.toLowerCase().includes('rate') || message.toLowerCase().includes('too many')) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
              'Too Many Attempts',
              'Please wait a while before requesting another reset code.',
              [{ text: 'OK' }]
            );
            return;
          }

          // Check for network errors
          if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connection')) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
              'Connection Error',
              'Unable to connect. Please check your internet and try again.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Retry', onPress: () => handleSubmit() },
              ]
            );
            return;
          }

          // For security, always show success message and navigate
          // This prevents account enumeration attacks
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.push({
            pathname: '/(auth)/reset-password',
            params: { email: sanitizedEmail },
          });
        },
      }
    );
  }, [email, validateForm, forgotPassword, router]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const isLoading = forgotPassword.isPending;
  const canSubmit = email.trim().length > 0 && !isLoading;

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
              className="self-start -ml-2 mb-8"
              accessibilityLabel="Go back"
              accessibilityHint="Returns to the login screen"
            >
              <View className="flex-row items-center">
                <Ionicons name="chevron-back" size={24} color="#3d405b" />
                <Text className="text-[#3d405b] font-medium ml-1">Back</Text>
              </View>
            </Button>

            {/* Header */}
            <View className="items-center mb-10">
              <Text
                className="text-[28px] font-semibold text-[#3d405b] text-center leading-tight"
                accessibilityRole="header"
              >
                Confirm your email
              </Text>
              <Text className="text-sm text-[#838383] text-center mt-2 px-4">
                Enter the email associated with your account and we'll send an email with code to reset your password
              </Text>
            </View>

            {/* Form */}
            <View className="gap-6">
              <AuthInput
                label="Email"
                value={email}
                onChangeText={handleEmailChange}
                onBlur={handleEmailBlur}
                error={error || undefined}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                autoFocus
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
                editable={!isLoading}
              />
            </View>

            {/* Info Box */}
            <View className="mt-4 bg-gray-50 p-4 rounded-xl">
              <View className="flex-row items-start">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#6b7280"
                />
                <Text className="text-sm text-gray-600 ml-2 flex-1">
                  We'll send a 6-digit code to your email. Check your spam folder if you don't see it.
                </Text>
              </View>
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
                accessibilityLabel={isLoading ? 'Sending reset code' : 'Send reset code'}
                accessibilityState={{ disabled: !canSubmit }}
              >
                Send Code
              </Button>
            </View>

            {/* Back to Login Link */}
            <View className="flex-row justify-center items-center mt-8">
              <Text className="text-base text-[#838383]">
                Remember your password?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                accessibilityRole="link"
                accessibilityLabel="Go to login"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text className="text-base font-semibold text-[#3d405b]">
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
