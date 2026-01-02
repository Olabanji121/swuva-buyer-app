import React, { useState, useMemo, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export const AuthInput = forwardRef<TextInput, AuthInputProps>(
  ({ label, error, isPassword = false, value, onBlur, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Memoize to prevent unnecessary recalculations
    const hasValue = useMemo(() => Boolean(value?.length), [value]);
    const showPasswordToggle = useMemo(
      () => isPassword && hasValue && (value?.length ?? 0) >= 3,
      [isPassword, hasValue, value?.length]
    );

    const handleFocus = () => setIsFocused(true);

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    // Announce errors to screen readers
    React.useEffect(() => {
      if (error) {
        AccessibilityInfo.announceForAccessibility(`Error: ${error}`);
      }
    }, [error]);

    return (
      <View className="w-full">
        <View
          className={`flex-row items-center border-b py-3.5 ${
            error
              ? 'border-red-500'
              : isFocused
                ? 'border-primary'
                : 'border-[#ededed]'
          }`}
        >
          <TextInput
            ref={ref}
            className="flex-1 text-base text-[#3d405b] font-normal"
            placeholder={label}
            placeholderTextColor="#838383"
            value={value}
            secureTextEntry={isPassword && !showPassword}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCapitalize={
              isPassword
                ? 'none'
                : props.keyboardType === 'email-address'
                  ? 'none'
                  : 'sentences'
            }
            // Accessibility
            accessibilityLabel={label}
            accessibilityHint={error || undefined}
            accessibilityState={{
              disabled: props.editable === false,
            }}
            // Keyboard handling defaults
            blurOnSubmit={props.returnKeyType === 'done' || props.returnKeyType === 'go'}
            {...props}
          />
          {showPasswordToggle && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              accessibilityRole="button"
              accessibilityHint="Toggles password visibility"
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#838383"
              />
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Text
            className="text-red-500 text-xs mt-1"
            accessibilityRole="alert"
          >
            {error}
          </Text>
        )}
      </View>
    );
  }
);

AuthInput.displayName = 'AuthInput';
