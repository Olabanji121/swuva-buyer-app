/**
 * HomeHeader Component
 *
 * Displays location selector and notification bell.
 * Based on Figma design node 3:401.
 */

import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cn } from '@/lib/utils';
import type { Location } from '../types';

interface HomeHeaderProps {
  location: Location;
  hasNotifications?: boolean;
  onLocationPress?: () => void;
  onNotificationPress?: () => void;
  className?: string;
}

export function HomeHeader({
  location,
  hasNotifications = true,
  onLocationPress,
  onNotificationPress,
  className,
}: HomeHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between px-7', className)}>
      {/* Location Section */}
      <Pressable onPress={onLocationPress} className="flex-1">
        <Text className="text-sm font-normal text-[#838383]">
          Location
        </Text>
        <View className="flex-row items-center gap-1 mt-0.5">
          <Ionicons name="location" size={16} color="#60d394" />
          <Text className="text-base font-semibold text-[#202226]">
            {location.city}, {location.country}
          </Text>
        </View>
      </Pressable>

      {/* Notification Bell */}
      <Pressable
        onPress={onNotificationPress}
        className="relative"
      >
        <Ionicons name="notifications-outline" size={24} color="#202226" />
        {hasNotifications && (
          <View className="absolute -top-0.5 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        )}
      </Pressable>
    </View>
  );
}
