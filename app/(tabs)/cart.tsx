/**
 * Cart Screen
 *
 * Displays user's shopping cart with items ready for checkout.
 */

import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />

      <View className="flex-1 items-center justify-center px-8">
        <View className="w-20 h-20 bg-[#ECFFF4] rounded-full items-center justify-center mb-4">
          <Ionicons name="cart" size={40} color="#60D394" />
        </View>
        <Text className="text-xl font-semibold text-[#3d405b] mb-2">
          Your Cart
        </Text>
        <Text className="text-sm text-[#AEAEB2] text-center">
          Add items to your cart to see them here
        </Text>
      </View>
    </SafeAreaView>
  );
}
