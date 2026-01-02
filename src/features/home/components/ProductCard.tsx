/**
 * ProductCard Component
 *
 * Displays a listing card with image, category tag, discount badge,
 * favorite button, seller info, rating, and price.
 * Used in New Listings (horizontal scroll) and Top Listings (vertical list).
 */

import { View, Text, Pressable, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { cva, type VariantProps } from 'class-variance-authority';
import * as Haptics from 'expo-haptics';

import { cn } from '@/lib/utils';
import type { Listing } from '../types';
import { AddToCartIcon } from '../data/assets';

const cardVariants = cva(
  'bg-white rounded-[20px]',
  {
    variants: {
      variant: {
        horizontal: 'w-[280px]',
        vertical: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'horizontal',
    },
  }
);

const imageVariants = cva('rounded-2xl', {
  variants: {
    variant: {
      horizontal: 'h-[180px]',
      vertical: 'h-[200px]',
    },
  },
  defaultVariants: {
    variant: 'horizontal',
  },
});

interface ProductCardProps extends VariantProps<typeof cardVariants> {
  listing: Listing;
  onPress?: () => void;
  onFavoritePress?: () => void;
  className?: string;
}

export function ProductCard({
  listing,
  variant,
  onPress,
  onFavoritePress,
  className,
}: ProductCardProps) {
  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavoritePress?.();
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      meals: 'Meals',
      bakery: 'Bakery',
      grocery: 'Groceries',
      all: 'All',
    };
    return labels[category] || category;
  };

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        cardVariants({ variant }),
        'p-3',
        className
      )}
      style={{
        // Figma: shadow-[0px_8px_15px_0px_rgba(0,0,0,0.02),0px_4px_10px_0px_rgba(0,0,0,0.02)]
        // Increased opacity for visibility on mobile
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.075,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      {/* Image Container */}
      <View className={cn('relative overflow-hidden rounded-2xl', imageVariants({ variant }))}>
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

        {/* Category Tag */}
        <View className="absolute top-3 left-3 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Text className="text-xs font-normal text-[#1a1a1a]">
            {getCategoryLabel(listing.category)}
          </Text>
        </View>

        {/* Favorite Button */}
        <Pressable
          onPress={handleFavoritePress}
          className="absolute top-3 right-3 bg-white/50 backdrop-blur-sm w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons
            name={listing.isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={listing.isFavorite ? '#ef4444' : '#1a1a1a'}
          />
        </Pressable>

        {/* Discount Badge */}
        <View className="absolute bottom-3 right-3 bg-primary px-3 py-1.5 rounded-full">
          <Text className="text-xs font-normal text-white">
            -{listing.discount}%
          </Text>
        </View>
      </View>

      {/* Info Section */}
      <View className="pt-3 gap-2">
        {/* Title & Meta */}
        <View className="gap-1">
          <Text
            className="text-base font-semibold text-[#3d405b]"
            numberOfLines={1}
          >
            {listing.title}
          </Text>

          {/* Seller, Distance, Time */}
          <View className="flex-row items-center gap-1 flex-wrap">
            <View className="flex-row items-center gap-1">
              <Ionicons name="location-outline" size={14} color="#aeaeb2" />
              <Text className="text-xs font-medium text-[#aeaeb2]">
                {listing.seller.name}
              </Text>
            </View>

            <View className="w-1 h-1 rounded-full bg-[#aeaeb2]" />

            <Text className="text-xs text-[#aeaeb2]">
              {listing.distance}km
            </Text>

            <View className="w-1 h-1 rounded-full bg-[#aeaeb2]" />

            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={14} color="#aeaeb2" />
              <Text className="text-xs font-medium text-[#aeaeb2]">
                {listing.timeLeft}
              </Text>
            </View>
          </View>

          {/* Star Rating */}
          <View className="flex-row items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.floor(listing.rating) ? 'star' : 'star-outline'}
                size={10}
                color="#F2C71C"
              />
            ))}
          </View>
        </View>

        {/* Price Row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-[#3d405b]">
            ${listing.price.toFixed(2)}
          </Text>
          <AddToCartIcon width={20} height={20} />
        </View>
      </View>
    </Pressable>
  );
}
