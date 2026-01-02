/**
 * FilterChip Component
 *
 * Selectable chip button for filter options.
 * Matches Figma design node 85:7385.
 */

import { Pressable, Text } from 'react-native';
import {
  LiquidGlassView,
  isLiquidGlassSupported,
} from '@callstack/liquid-glass';

import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}

export function FilterChip({
  label,
  selected = false,
  onPress,
  className,
}: FilterChipProps) {
  // Selected state - use liquid glass on iOS 26+ for nice green effect
  if (selected && isLiquidGlassSupported) {
    return (
      <Pressable onPress={onPress} className={className}>
        <LiquidGlassView
          style={{
            paddingHorizontal: 18,
            paddingVertical: 9,
            borderRadius: 9999,
          }}
          effect="regular"
          interactive
          tintColor="#60d394"
        >
          <Text className="text-[14px] font-normal text-center text-white">
            {label}
          </Text>
        </LiquidGlassView>
      </Pressable>
    );
  }

  // Unselected: transparent background with thin border (matches Figma exactly)
  // Selected fallback: solid green fill
  return (
    <Pressable
      onPress={onPress}
      className={cn('px-[18px] py-[9px] rounded-full', className)}
      style={
        selected
          ? { backgroundColor: '#60d394' }
          : { backgroundColor: 'transparent', borderWidth: 0.667, borderColor: '#dee2e6' }
      }
    >
      <Text
        className="text-[14px] font-normal text-center"
        style={{ color: selected ? '#ffffff' : '#aeaeb2' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
