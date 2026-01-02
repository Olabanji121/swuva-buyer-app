/**
 * ProductHeader Component
 *
 * Header for product detail screen with back, title, favorite and map icons.
 * Matches Figma design node 57:63432.
 */

import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

import ChevronLeftIcon from '../../../../assets/icons/chevron-left.svg';
import HeartIcon from '../../../../assets/icons/heart.svg';
import MapPinIcon from '../../../../assets/icons/map-pin.svg';

interface ProductHeaderProps {
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  onMapPress?: () => void;
}

export function ProductHeader({
  isFavorite = false,
  onFavoritePress,
  onMapPress,
}: ProductHeaderProps) {
  return (
    <View className="flex-row items-center gap-2 px-7">
      {/* Back Button */}
      <Pressable
        onPress={() => router.back()}
        className="items-center justify-center p-3 rounded-full"
        style={{ borderWidth: 1, borderColor: '#ededed' }}
      >
        <ChevronLeftIcon width={24} height={24} />
      </Pressable>

      {/* Title */}
      <Text className="flex-1 text-[16px] font-bold text-[#202226] text-center">
        Product Detail
      </Text>

      {/* Favorite Button */}
      <Pressable
        onPress={onFavoritePress}
        className="items-center justify-center p-3 rounded-full"
        style={{ borderWidth: 1, borderColor: '#ededed' }}
      >
        <HeartIcon width={24} height={24} />
      </Pressable>

      {/* Map Button */}
      <Pressable
        onPress={onMapPress}
        className="items-center justify-center p-3 rounded-full"
        style={{ borderWidth: 1, borderColor: '#ededed' }}
      >
        <MapPinIcon width={24} height={24} />
      </Pressable>
    </View>
  );
}
