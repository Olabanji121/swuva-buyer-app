/**
 * OTP Input Component
 *
 * A 6-digit OTP code input with auto-focus and keyboard navigation.
 * Each digit is displayed in a separate box with bottom border styling.
 */

import { useState, useRef, useCallback, useEffect, memo } from 'react';
import {
  View,
  TextInput,
  Pressable,
  AccessibilityInfo,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const OTPInput = memo(function OTPInput({
  length = 6,
  value,
  onChange,
  error = false,
  disabled = false,
  autoFocus = true,
}: OTPInputProps) {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Split value into array of digits
  const digits = value.split('').slice(0, length);

  // Focus first empty input on mount
  useEffect(() => {
    if (autoFocus && !disabled) {
      const firstEmptyIndex = digits.length < length ? digits.length : length - 1;
      setTimeout(() => {
        inputRefs.current[firstEmptyIndex]?.focus();
      }, 100);
    }
  }, [autoFocus, disabled, digits.length, length]);

  const handleDigitChange = useCallback(
    (text: string, index: number) => {
      // Only allow numeric input
      const digit = text.replace(/[^0-9]/g, '').slice(-1);

      if (digit) {
        // Insert digit at index
        const newValue = value.split('');
        newValue[index] = digit;
        const updatedValue = newValue.join('').slice(0, length);
        onChange(updatedValue);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Auto-advance to next input
        if (index < length - 1) {
          inputRefs.current[index + 1]?.focus();
        }

        // Announce for accessibility
        if (updatedValue.length === length) {
          AccessibilityInfo.announceForAccessibility('Code complete');
        }
      }
    },
    [value, length, onChange]
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace') {
        const newValue = value.split('');

        if (newValue[index]) {
          // Clear current digit
          newValue[index] = '';
          onChange(newValue.join(''));
        } else if (index > 0) {
          // Move to previous input and clear it
          newValue[index - 1] = '';
          onChange(newValue.join(''));
          inputRefs.current[index - 1]?.focus();
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [value, onChange]
  );

  const handleBoxPress = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  return (
    <View
      className="flex-row gap-3 items-center justify-center"
      accessibilityRole="none"
      accessibilityLabel={`Enter ${length}-digit verification code`}
    >
      {Array.from({ length }).map((_, index) => {
        const digit = digits[index] || '';
        const isFocused = focusedIndex === index;
        const hasValue = digit !== '';

        return (
          <Pressable
            key={index}
            onPress={() => handleBoxPress(index)}
            disabled={disabled}
            accessibilityRole="none"
          >
            <View
              className={`w-[52px] h-[58px] items-center justify-center border-b-2 ${
                error
                  ? 'border-red-500'
                  : isFocused
                    ? 'border-primary'
                    : 'border-[#e5e7eb]'
              }`}
            >
              <TextInput
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(text) => handleDigitChange(text, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!disabled}
                selectTextOnFocus
                caretHidden
                className={`text-[22px] font-semibold text-[#3d405b] text-center w-full h-full ${
                  disabled ? 'opacity-50' : ''
                }`}
                accessibilityLabel={`Digit ${index + 1} of ${length}${hasValue ? `, value ${digit}` : ''}`}
                accessibilityHint="Enter a single digit"
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
});

export default OTPInput;
