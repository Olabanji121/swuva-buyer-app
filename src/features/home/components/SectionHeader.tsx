/**
 * SectionHeader Component
 *
 * Displays section title with optional "See all" link.
 * Used for New Listings, Favorites, and Top Listings sections.
 */

import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  showSeeAll?: boolean;
  onSeeAllPress?: () => void;
  rightIcon?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  showSeeAll = true,
  onSeeAllPress,
  rightIcon,
  className,
}: SectionHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between px-7', className)}>
      <View className="flex-row items-center gap-1.5">
        <Text className="text-base font-semibold text-[#3d405b]">
          {title}
        </Text>
        {rightIcon}
      </View>

      {showSeeAll && (
        <Pressable
          onPress={onSeeAllPress}
          className="bg-[#ECFFF4] px-2 py-1 rounded-[11px]"
        >
          <Text className="text-sm font-semibold text-primary leading-[160%]">
            See all
          </Text>
        </Pressable>
      )}
    </View>
  );
}
