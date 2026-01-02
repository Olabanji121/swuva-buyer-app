/**
 * ProductInfo Component
 *
 * Product name, seller location, distance, rating, and pricing.
 * Matches Figma design node 58:64460.
 */

import { View, Text, Pressable } from 'react-native';

import MapPinSmallIcon from '../../../../assets/icons/map-pin-small.svg';
import StarIcon from '../../../../assets/icons/star.svg';

interface ProductInfoProps {
  name: string;
  sellerName: string;
  distance: string;
  rating: number;
  originalPrice: number;
  currentPrice: number;
  onSellerPress?: () => void;
}

export function ProductInfo({
  name,
  sellerName,
  distance,
  rating,
  originalPrice,
  currentPrice,
  onSellerPress,
}: ProductInfoProps) {
  return (
    <View className="flex-row items-start justify-between w-full">
      {/* Left: Name + Location + Rating */}
      <Pressable onPress={onSellerPress} className="flex-1 gap-1">
        <Text className="text-[22px] font-semibold text-[#202226]">{name}</Text>

        <View className="flex-row items-center gap-1 h-[22px]">
          {/* Location */}
          <View className="flex-row items-center gap-1">
            <MapPinSmallIcon width={16} height={16} />
            <Text className="text-[12px] font-medium text-[#aeaeb2]">
              {sellerName}
            </Text>
          </View>

          {/* Separator */}
          <View className="size-1 rounded-full bg-[#aeaeb2]" />

          {/* Distance */}
          <Text className="text-[12px] font-normal text-[#aeaeb2]">
            {distance}
          </Text>

          {/* Separator */}
          <View className="size-1 rounded-full bg-[#aeaeb2]" />

          {/* Rating */}
          <View className="flex-row items-center gap-2">
            <StarIcon width={10} height={10} />
            <Text className="text-[12px] font-medium text-[#838383]">
              {rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Right: Prices */}
      <View className="items-center gap-[10px]">
        <Text className="text-[14px] font-normal text-[#3d405b] line-through">
          ${originalPrice.toFixed(2)}
        </Text>
        <Text className="text-[16px] font-semibold text-[#3d405b]">
          ${currentPrice.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}
