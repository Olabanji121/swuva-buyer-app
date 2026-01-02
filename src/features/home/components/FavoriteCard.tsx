/**
 * FavoriteCard Component
 *
 * Compact card for the Favorites horizontal scroll section.
 * Shows image with heart button, title, price, and rating.
 */

import { View, Text, Pressable, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { cn } from '@/lib/utils';
import type { Listing } from '../types';

interface FavoriteCardProps {
  listing: Listing;
  onPress?: () => void;
  onFavoritePress?: () => void;
  className?: string;
}

export function FavoriteCard({
  listing,
  onPress,
  onFavoritePress,
  className,
}: FavoriteCardProps) {
  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavoritePress?.();
  };

  return (
    <Pressable
      onPress={onPress}
      className={cn('w-[124px]', className)}
    >
      {/* Image Container */}
      <View className="relative h-[124px] rounded-xl overflow-hidden">
        {typeof listing.image === 'string' ? (
          <Image
            source={{ uri: listing.image }}
            className="w-full h-full"
            contentFit="cover"
            transition={200}
          />
        ) : (
          <RNImage
            source={listing.image}
            className="w-full h-full"
            resizeMode="cover"
          />
        )}

        {/* Favorite Button */}
        <Pressable
          onPress={handleFavoritePress}
          className="absolute top-1.5 right-1.5 bg-white/50 backdrop-blur-sm w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons
            name={listing.isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={listing.isFavorite ? '#ef4444' : '#1a1a1a'}
          />
        </Pressable>
      </View>

      {/* Info Section */}
      <View className="pt-1.5 flex-row justify-between">
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-[#202020]"
            numberOfLines={1}
          >
            {listing.title}
          </Text>
          <Text className="text-sm font-semibold text-[#81838f]">
            ${listing.price.toFixed(2)}
          </Text>
        </View>

        {/* Rating */}
        <View className="flex-row items-start gap-0.5 pt-1">
          <Ionicons name="star" size={10} color="#F2C71C" />
          <Text className="text-xs font-medium text-[#81838f]">
            {listing.rating.toFixed(1)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
