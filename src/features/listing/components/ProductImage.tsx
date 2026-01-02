/**
 * ProductImage Component
 *
 * Large product image with map pin overlay.
 * Matches Figma design node 57:63438.
 */

import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';

import MapPinIcon from '../../../../assets/icons/map-pin.svg';

interface ProductImageProps {
  imageUrl: string;
  onMapPress?: () => void;
}

export function ProductImage({ imageUrl, onMapPress }: ProductImageProps) {
  return (
    <View className="w-full h-[335px] rounded-[24px] overflow-hidden bg-[#f3f3f3]">
      <Image
        source={{ uri: imageUrl }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={200}
      />

      {/* Map Pin Overlay */}
      <Pressable
        onPress={onMapPress}
        className="absolute top-[14px] right-[15px] p-1 rounded-full bg-[#ecfff4]"
        style={{ borderWidth: 1, borderColor: '#ededed' }}
      >
        <MapPinIcon width={24} height={24} />
      </Pressable>
    </View>
  );
}
