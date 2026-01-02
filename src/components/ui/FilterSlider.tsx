/**
 * FilterSlider Component
 *
 * Custom slider for filter values with green track and liquid glass thumb.
 * Matches Figma design node 84:7315 with iOS 26 liquid glass enhancement.
 */

import { View, Text, PanResponder, LayoutChangeEvent } from 'react-native';
import { useCallback, useRef, useState, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  LiquidGlassView,
  isLiquidGlassSupported,
} from '@callstack/liquid-glass';

import { cn } from '@/lib/utils';

interface FilterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  prefix?: string;
  onValueChange: (value: number) => void;
  className?: string;
}

export function FilterSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  prefix = '',
  onValueChange,
  className,
}: FilterSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const thumbSize = 26;
  const currentValue = useRef(value);

  // Calculate position from value
  const valueToPosition = useCallback(
    (val: number) => {
      if (trackWidth <= thumbSize) return 0;
      const range = max - min;
      const percentage = (val - min) / range;
      return percentage * (trackWidth - thumbSize);
    },
    [trackWidth, min, max, thumbSize]
  );

  // Calculate value from position
  const positionToValue = useCallback(
    (pos: number) => {
      if (trackWidth <= thumbSize) return min;
      const percentage = pos / (trackWidth - thumbSize);
      const rawValue = min + percentage * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    },
    [trackWidth, min, max, step, thumbSize]
  );

  const translateX = useSharedValue(valueToPosition(value));
  const startX = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startX.current = translateX.value;
        },
        onPanResponderMove: (_, gestureState) => {
          const newX = Math.max(
            0,
            Math.min(trackWidth - thumbSize, startX.current + gestureState.dx)
          );
          translateX.value = newX;
          const newValue = positionToValue(newX);
          if (newValue !== currentValue.current) {
            currentValue.current = newValue;
            onValueChange(newValue);
          }
        },
        onPanResponderRelease: () => {
          // Snap to nearest step
          const snappedValue = positionToValue(translateX.value);
          translateX.value = withSpring(valueToPosition(snappedValue), {
            damping: 20,
            stiffness: 300,
          });
        },
      }),
    [trackWidth, positionToValue, valueToPosition, onValueChange, thumbSize, translateX]
  );

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: translateX.value + thumbSize / 2,
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth(width);
  };

  // Update position when value changes externally
  useMemo(() => {
    if (trackWidth > 0) {
      translateX.value = valueToPosition(value);
    }
  }, [value, trackWidth, valueToPosition, translateX]);

  // Format display value
  const displayValue = `${prefix}${value}${unit}`;

  // Value pill - matches Figma: #F6F6F6 bg, 8px radius
  const ValuePill = (
    <View
      style={{
        backgroundColor: '#F6F6F6',
        borderRadius: 8,
        paddingHorizontal: 5,
        paddingVertical: 4,
      }}
    >
      <Text className="text-[16px] font-medium text-[#aeaeb2]">
        {displayValue}
      </Text>
    </View>
  );

  return (
    <View className={cn('gap-4', className)}>
      {/* Header with label and value */}
      <View className="flex-row items-center justify-between">
        <Text className="text-[16px] font-medium text-[#212529]">{label}</Text>
        {ValuePill}
      </View>

      {/* Slider container */}
      <View className="relative h-[26px] justify-center" onLayout={handleLayout}>
        {/* Track background */}
        <View className="absolute left-0 right-0 h-4 bg-[#ececf0] rounded-full" />

        {/* Filled portion */}
        <Animated.View
          className="absolute left-0 h-4 bg-[#7adaa6] rounded-full"
          style={fillStyle}
        />

        {/* Thumb - matches Figma: #60d394 with 1.083px border and specific shadow */}
        <Animated.View
          className="absolute size-[26px] rounded-full"
          style={[
            thumbStyle,
            {
              backgroundColor: '#60d394',
              borderWidth: 1.083,
              borderColor: '#60d394',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1.625 },
              shadowOpacity: 0.1,
              shadowRadius: 4.875,
              elevation: 4,
            },
          ]}
          {...panResponder.panHandlers}
        />
      </View>
    </View>
  );
}
