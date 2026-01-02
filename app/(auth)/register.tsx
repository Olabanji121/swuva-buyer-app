/**
 * Registration Screen
 *
 * Allows new users to create a buyer account.
 * Uses TanStack Query for API calls.
 */

import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AuthInput, SocialButtons } from '@/components/auth';
import { Button } from '@/components/ui';
import { useSignUp, useRequestOTP } from '@/features/auth';
import { getErrorMessage } from '@/lib/api';
import {
  validateEmail,
  validatePassword,
  sanitizeEmail,
  sanitizeInput,
  PASSWORD_MIN_LENGTH,
} from '@/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();

  // TanStack Query mutations
  const signUp = useSignUp();
  const requestOTP = useRequestOTP();

  // Input refs for keyboard navigation
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  // Clear error when user starts typing
  const handleFullNameChange = useCallback((text: string) => {
    setFullName(text);
    if (errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: undefined }));
    }
  }, [errors.fullName]);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  }, [errors.email]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
    // Also clear confirm password error if passwords now match
    if (errors.confirmPassword && text === confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  }, [errors.password, errors.confirmPassword, confirmPassword]);

  const handleConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  }, [errors.confirmPassword]);

  const validateForm = useCallback(() => {
    const newErrors: typeof errors = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      newErrors.fullName = 'Full name is required';
    } else if (trimmedName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fullName, email, password, confirmPassword, agreeToTerms]);

  const handleRegister = useCallback(async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Sanitize inputs
    const sanitizedName = sanitizeInput(fullName);
    const sanitizedEmail = sanitizeEmail(email);

    // Step 1: Sign up
    signUp.mutate(
      {
        email: sanitizedEmail,
        password,
        name: sanitizedName,
      },
      {
        onSuccess: () => {
          // Step 2: Request OTP for email verification
          requestOTP.mutate(
            {
              email: sanitizedEmail,
              type: 'email-verification',
            },
            {
              onSuccess: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                // Navigate to OTP verification screen
                router.push({
                  pathname: '/(auth)/verify-otp',
                  params: {
                    email: sanitizedEmail,
                    name: sanitizedName,
                  },
                });
              },
              onError: (err) => {
                // Sign-up succeeded but OTP request failed
                // Still navigate to OTP screen - user can resend
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                router.push({
                  pathname: '/(auth)/verify-otp',
                  params: {
                    email: sanitizedEmail,
                    name: sanitizedName,
                  },
                });
              },
            }
          );
        },
        onError: (err) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          const message = getErrorMessage(err);

          // Check for specific error types
          if (message.toLowerCase().includes('email') && message.toLowerCase().includes('exist')) {
            setErrors((prev) => ({ ...prev, email: 'This email is already registered' }));
          } else {
            Alert.alert('Registration Failed', message);
          }
        },
      }
    );
  }, [fullName, email, password, validateForm, signUp, requestOTP, router]);

  const toggleAgreeToTerms = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAgreeToTerms((prev) => !prev);
    if (errors.terms) {
      setErrors((prev) => ({ ...prev, terms: undefined }));
    }
  }, [errors.terms]);

  // Loading state from mutations
  const isLoading = signUp.isPending || requestOTP.isPending;

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
          <View className="flex-1 px-7 pt-16">
            {/* Header */}
            <View className="items-center mb-16">
              <Text className="text-[28px] font-semibold text-[#3d405b] text-center leading-tight">
                Register to join us
              </Text>
              <Text className="text-sm text-[#838383] text-center mt-1">
                Welcome, Please enter your details to begin.
              </Text>
            </View>

            {/* Registration Form */}
            <View className="gap-6">
              {/* Full Name Input */}
              <AuthInput
                label="Full Name"
                value={fullName}
                onChangeText={handleFullNameChange}
                error={errors.fullName}
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />

              {/* Email Input */}
              <AuthInput
                ref={emailRef}
                label="Email"
                value={email}
                onChangeText={handleEmailChange}
                error={errors.email}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              {/* Password Input */}
              <AuthInput
                ref={passwordRef}
                label="Create Password"
                value={password}
                onChangeText={handlePasswordChange}
                error={errors.password}
                isPassword
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />

              {/* Confirm Password Input */}
              <AuthInput
                ref={confirmPasswordRef}
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                error={errors.confirmPassword}
                isPassword
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />

              {/* Terms & Conditions */}
              <TouchableOpacity
                onPress={toggleAgreeToTerms}
                className="flex-row items-center py-2"
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreeToTerms }}
                accessibilityLabel="I agree to Terms and conditions"
              >
                <View
                  className={`w-5 h-5 rounded border ${
                    agreeToTerms
                      ? 'bg-primary border-primary'
                      : errors.terms
                        ? 'border-red-500'
                        : 'border-[#838383]'
                  } items-center justify-center mr-3`}
                >
                  {agreeToTerms && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
                <Text className="flex-1 text-sm font-medium text-[#3d405b]">
                  I agree to Terms and condition
                </Text>
              </TouchableOpacity>
              {errors.terms && (
                <Text
                  className="text-red-500 text-xs -mt-4"
                  accessibilityRole="alert"
                >
                  {errors.terms}
                </Text>
              )}
            </View>

            {/* Register Button */}
            <View className="mt-8">
              <Button
                variant="primary"
                size="lg"
                onPress={handleRegister}
                disabled={isLoading}
                loading={isLoading}
                className="h-[62px]"
              >
                {isLoading ? 'Creating account...' : 'Register'}
              </Button>
            </View>

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-[#d9d9d9]" />
              <Text className="mx-4 text-base text-[#838383]">Or</Text>
              <View className="flex-1 h-px bg-[#d9d9d9]" />
            </View>

            {/* Social Login Buttons */}
            <SocialButtons
              onApplePress={() =>
                Alert.alert('Coming Soon', 'Apple Sign In will be available soon.')
              }
              onGooglePress={() =>
                Alert.alert('Coming Soon', 'Google Sign In will be available soon.')
              }
              disabled={isLoading}
            />

            {/* Login Link */}
            <View className="flex-row justify-center mt-8 mb-6">
              <Text className="text-base text-[#838383]">
                Have an account?{' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity
                  accessibilityRole="link"
                  accessibilityLabel="Go to login"
                >
                  <Text className="text-base font-semibold text-[#3d405b]">
                    Login
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
