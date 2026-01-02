/**
 * PromoBanner Component
 *
 * Promotional banner with discount message and CTA button.
 * Based on Figma design node 26:1127.
 */

import { View, Text, Pressable, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';

import { cn } from '@/lib/utils';
import type { PromoBanner as PromoBannerType } from '../types';

interface PromoBannerProps {
  banner: PromoBannerType;
  onPress?: () => void;
  className?: string;
}

export function PromoBanner({
  banner,
  onPress,
  className,
}: PromoBannerProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'mx-7 h-[142px] rounded-[10px] overflow-hidden',
        className
      )}
      style={{ backgroundColor: banner.backgroundColor }}
    >
      {/* Background Pattern Overlay */}
      <View className="absolute inset-0 bg-white/5" />

      {/* Content */}
      <View className="flex-1 flex-row">
        {/* Text Section */}
        <View className="flex-1 justify-center px-4 py-5">
          <Text className="text-xl font-semibold text-white leading-7 w-[199px]">
            {banner.title}
          </Text>
          <Pressable
            onPress={onPress}
            className="mt-2 bg-[#101010] self-start px-4 py-2 rounded-full"
          >
            <Text className="text-sm font-semibold text-white">
              {banner.buttonText}
            </Text>
          </Pressable>
        </View>

        {/* Image Section */}
        <View className="w-[160px] justify-center">
          {typeof banner.image === 'string' ? (
            <Image
              source={{ uri: banner.image }}
              className="w-[150px] h-[120px]"
              contentFit="contain"
              transition={200}
            />
          ) : (
            <RNImage
              source={banner.image}
              className="w-[150px] h-[120px]"
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}
