import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SocialButtonsProps {
  onApplePress?: () => void;
  onGooglePress?: () => void;
  disabled?: boolean;
}

export function SocialButtons({
  onApplePress,
  onGooglePress,
  disabled = false,
}: SocialButtonsProps) {
  return (
    <View className="gap-4">
      {/* Apple Button - Only show on iOS or if onApplePress is provided */}
      {(Platform.OS === 'ios' || onApplePress) && (
        <TouchableOpacity
          onPress={onApplePress}
          disabled={disabled || !onApplePress}
          className={`flex-row items-center justify-center h-14 bg-white rounded-xl shadow-sm border border-gray-100 ${
            disabled ? 'opacity-50' : ''
          }`}
          activeOpacity={0.7}
          accessibilityLabel="Continue with Apple"
          accessibilityRole="button"
          accessibilityHint="Sign in using your Apple ID"
          accessibilityState={{ disabled: disabled || !onApplePress }}
        >
          <Ionicons name="logo-apple" size={24} color="#000" />
          <Text className="ml-3 text-base font-medium text-black">
            Continue with Apple
          </Text>
        </TouchableOpacity>
      )}

      {/* Google Button */}
      <TouchableOpacity
        onPress={onGooglePress}
        disabled={disabled || !onGooglePress}
        className={`flex-row items-center justify-center h-14 bg-white rounded-xl shadow-sm border border-gray-100 ${
          disabled ? 'opacity-50' : ''
        }`}
        activeOpacity={0.7}
        accessibilityLabel="Continue with Google"
        accessibilityRole="button"
        accessibilityHint="Sign in using your Google account"
        accessibilityState={{ disabled: disabled || !onGooglePress }}
      >
        <Ionicons name="logo-google" size={22} color="#4285F4" />
        <Text className="ml-3 text-base font-medium text-black">
          Continue with Google
        </Text>
      </TouchableOpacity>
    </View>
  );
}
