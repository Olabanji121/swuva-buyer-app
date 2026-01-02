/**
 * BottomCartBar Component
 *
 * Fixed bottom bar with quantity selector, total price, and add to cart button.
 * Quantity selector placed here for better UX - always visible without scrolling.
 */

import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CalendarWhiteIcon from '../../../../assets/icons/calendar-white.svg';
import MinusIcon from '../../../../assets/icons/minus.svg';
import PlusIcon from '../../../../assets/icons/plus.svg';

interface BottomCartBarProps {
  unitPrice: number;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxQuantity?: number;
  onAddToCart: () => void;
  loading?: boolean;
}

export function BottomCartBar({
  unitPrice,
  quantity,
  onQuantityChange,
  maxQuantity = 10,
  onAddToCart,
  loading = false,
}: BottomCartBarProps) {
  const insets = useSafeAreaInsets();
  const totalPrice = unitPrice * quantity;

  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] px-7"
      style={{
        paddingTop: 20,
        paddingBottom: Math.max(insets.bottom, 24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 50,
        elevation: 10,
      }}
    >
      {/* Quantity Selector Row */}
      <View className="flex-row items-center justify-center gap-6 mb-4">
        <Pressable
          onPress={handleDecrease}
          className="size-[36px] rounded-full bg-[#ecfff4] items-center justify-center"
          disabled={quantity <= 1}
          style={{ opacity: quantity <= 1 ? 0.5 : 1 }}
        >
          <MinusIcon width={24} height={24} />
        </Pressable>

        <Text className="text-[20px] font-semibold text-[#60d394] min-w-[40px] text-center">
          {quantity}
        </Text>

        <Pressable
          onPress={handleIncrease}
          className="size-[36px] rounded-full bg-[#60d394] items-center justify-center"
          disabled={quantity >= maxQuantity}
          style={{ opacity: quantity >= maxQuantity ? 0.5 : 1 }}
        >
          <PlusIcon width={24} height={24} />
        </Pressable>
      </View>

      {/* Price + Add to Cart Row */}
      <View className="flex-row items-center justify-between">
        {/* Price */}
        <View>
          <Text className="text-[12px] font-normal text-[#838383]">
            Total Price
          </Text>
          <Text className="text-[20px] font-semibold text-[#202226]">
            ${totalPrice.toFixed(2)}
          </Text>
        </View>

        {/* Add to Cart Button */}
        <Pressable
          onPress={onAddToCart}
          disabled={loading}
          className="flex-row items-center gap-2 bg-[#60d394] px-8 py-[18px] rounded-[16px]"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          <CalendarWhiteIcon width={24} height={24} />
          <Text className="text-[16px] font-bold text-white">Add to Cart</Text>
        </Pressable>
      </View>
    </View>
  );
}
