/**
 * ProductDescription Component
 *
 * Card with product description text.
 * Quantity selector moved to BottomCartBar for better UX.
 */

import { View, Text } from 'react-native';

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <View
      className="w-full bg-white rounded-[20px] p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <Text className="text-[16px] font-medium text-[#838383] leading-[1.6]">
        {description}
      </Text>
    </View>
  );
}
