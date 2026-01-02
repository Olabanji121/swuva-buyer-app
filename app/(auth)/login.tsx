/**
 * Login Screen
 *
 * Allows existing users to sign in to their buyer account.
 * Uses TanStack Query for API calls.
 */

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthInput, SocialButtons } from "@/components/auth";
import { Button } from "@/components/ui";
import { useSignIn } from "@/features/auth";
import { getErrorMessage } from "@/lib/api";
import {
  PASSWORD_MIN_LENGTH,
  sanitizeEmail,
  validateEmail,
  validatePassword,
} from "@/utils/validation";

const REMEMBERED_EMAIL_KEY = "swuva-remembered-email";

export default function LoginScreen() {
  const router = useRouter();

  // TanStack Query mutation
  const signIn = useSignIn();

  // Input refs for keyboard navigation
  const passwordRef = useRef<TextInput>(null);

  // Form state - initialize email from remembered email if available
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Ref to track rememberMe for use in async callbacks (avoids stale closure)
  const rememberMeRef = useRef(rememberMe);
  rememberMeRef.current = rememberMe;
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  // Load remembered email from AsyncStorage on mount
  useEffect(() => {
    let isMounted = true;

    const loadRememberedEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);
        if (!isMounted) return;

        if (storedEmail) {
          setEmail(storedEmail);
          setRememberMe(true);
          // Keep ref in sync even before the next render
          rememberMeRef.current = true;
        }
      } catch (e) {
        // Ignore AsyncStorage errors
      }
    };

    loadRememberedEmail();

    return () => {
      isMounted = false;
    };
  }, []);

  // Clear error when user starts typing
  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);
      if (errors.email) {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    },
    [errors.email]
  );

  const handlePasswordChange = useCallback(
    (text: string) => {
      setPassword(text);
      if (errors.password) {
        setErrors((prev) => ({ ...prev, password: undefined }));
      }
    },
    [errors.password]
  );

  const validateForm = useCallback(() => {
    const newErrors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(trimmedEmail)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    // Use ref to avoid race condition if user toggles checkbox then taps login quickly
    const shouldRemember = rememberMeRef.current;
    console.log(
      "[LoginScreen] handleLogin called, rememberMe =",
      shouldRemember
    );

    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Sanitize email before API call
    const sanitizedEmail = sanitizeEmail(email);

    // Persist remembered email directly to AsyncStorage
    try {
      if (shouldRemember) {
        await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, sanitizedEmail);
      } else {
        await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    } catch (e) {
      // Ignore AsyncStorage errors
    }

    console.log("[LoginScreen] Calling signIn.mutate...");
    signIn.mutate(
      {
        email: sanitizedEmail,
        password,
        rememberMe: shouldRemember,
      },
      {
        onSuccess: () => {
          console.log("[LoginScreen] === onSuccess CALLED ===");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          console.log("[LoginScreen] About to navigate to tabs...");
          router.replace("/(tabs)");
        },
        onError: (err) => {
          console.log("[LoginScreen] === onError CALLED ===", err);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          const message = getErrorMessage(err);

          // Check for specific error types
          if (
            message.toLowerCase().includes("credential") ||
            message.toLowerCase().includes("password")
          ) {
            setErrors((prev) => ({
              ...prev,
              password: "Invalid email or password",
            }));
          } else if (
            message.toLowerCase().includes("not found") ||
            message.toLowerCase().includes("no user")
          ) {
            setErrors((prev) => ({
              ...prev,
              email: "No account found with this email",
            }));
          } else {
            Alert.alert("Login Failed", message);
          }
        },
      }
    );
  }, [email, password, validateForm, signIn, router]);

  const handleForgotPassword = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(auth)/forgot-password");
  }, [router]);

  const toggleRememberMe = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !rememberMeRef.current;
    console.log(
      "[LoginScreen] toggleRememberMe:",
      rememberMeRef.current,
      "->",
      newValue
    );
    rememberMeRef.current = newValue;
    setRememberMe(newValue);

    if (!newValue) {
      AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY).catch(() => {});
    }
  }, []);

  // Loading state from mutation
  const isLoading = signIn.isPending;

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <StatusBar style='dark' />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className='flex-1'>
        <ScrollView
          className='flex-1'
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='on-drag'
          showsVerticalScrollIndicator={false}>
          <View className='flex-1 px-7 pt-16'>
            {/* Header */}
            <View className='items-center mb-16'>
              <Text className='text-[28px] font-semibold text-[#3d405b] text-center leading-tight'>
                Welcome Back
              </Text>
              <Text className='text-sm text-[#838383] text-center mt-1'>
                Welcome back! Please enter your details.
              </Text>
            </View>

            {/* Login Form */}
            <View className='gap-6'>
              {/* Email Input */}
              <AuthInput
                label='Email'
                value={email}
                onChangeText={handleEmailChange}
                error={errors.email}
                keyboardType='email-address'
                autoComplete='email'
                autoCapitalize='none'
                returnKeyType='next'
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              {/* Password Input */}
              <AuthInput
                ref={passwordRef}
                label='Password'
                value={password}
                onChangeText={handlePasswordChange}
                error={errors.password}
                isPassword
                autoComplete='password'
                returnKeyType='go'
                onSubmitEditing={handleLogin}
              />

              {/* Remember Me & Forgot Password */}
              <View className='flex-row items-center justify-between'>
                <TouchableOpacity
                  onPress={toggleRememberMe}
                  className='flex-row items-center py-2'
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole='checkbox'
                  accessibilityState={{ checked: rememberMe }}
                  accessibilityLabel='Remember me'>
                  <View
                    className={`w-5 h-5 rounded border ${
                      rememberMe
                        ? "bg-primary border-primary"
                        : "border-[#838383]"
                    } items-center justify-center mr-2`}>
                    {rememberMe && (
                      <Ionicons name='checkmark' size={14} color='#fff' />
                    )}
                  </View>
                  <Text className='text-sm font-medium text-[#3d405b]'>
                    Remember me
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole='link'
                  accessibilityLabel='Forgot password'>
                  <Text className='text-sm font-medium text-[#3d405b]'>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <View className='mt-8'>
              <Button
                variant='primary'
                size='lg'
                onPress={handleLogin}
                disabled={isLoading}
                loading={isLoading}
                className='h-[62px]'>
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </View>

            {/* Divider */}
            <View className='flex-row items-center my-8'>
              <View className='flex-1 h-px bg-[#d9d9d9]' />
              <Text className='mx-4 text-base text-[#838383]'>Or</Text>
              <View className='flex-1 h-px bg-[#d9d9d9]' />
            </View>

            {/* Social Login Buttons */}
            <SocialButtons
              onApplePress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Apple Sign In will be available soon."
                )
              }
              onGooglePress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Google Sign In will be available soon."
                )
              }
              disabled={isLoading}
            />

            {/* Sign Up Link */}
            <View className='flex-row justify-center mt-8 mb-6'>
              <Text className='text-base text-[#838383]'>
                Don't have an account?{" "}
              </Text>
              <Link href='/(auth)/register' asChild>
                <TouchableOpacity
                  accessibilityRole='link'
                  accessibilityLabel='Go to sign up'>
                  <Text className='text-base font-semibold text-[#3d405b]'>
                    Signup
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
