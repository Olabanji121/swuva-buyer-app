/**
 * PickupInfoCard Component
 *
 * Card showing expiration time and pickup window.
 * Matches Figma design node 58:64707.
 */

import { View, Text } from 'react-native';

import ClockIcon from '../../../../assets/icons/clock.svg';
import CalendarIcon from '../../../../assets/icons/calendar.svg';

interface PickupInfoCardProps {
  expiresAt: string;
  timeLeft: string;
  pickupWindow: string;
}

export function PickupInfoCard({
  expiresAt,
  timeLeft,
  pickupWindow,
}: PickupInfoCardProps) {
  return (
    <View
      className="w-full bg-white rounded-[14px] flex-row"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      {/* Expires In */}
      <View className="flex-1 flex-row items-center gap-1 px-3 py-[10px]">
        <View className="size-[30px] rounded-full bg-[rgba(96,211,148,0.1)] items-center justify-center">
          <ClockIcon width={15} height={15} />
        </View>
        <View className="h-[44px] justify-center">
          <Text className="text-[12px] font-normal text-[#6c757d]">
            Expires in
          </Text>
          <View className="flex-row items-center">
            <Text className="text-[14px] font-medium text-[#1a1a1a]">
              {expiresAt}
            </Text>
            <Text className="text-[12px] font-normal text-[#6c757d]">
              ({timeLeft})
            </Text>
          </View>
        </View>
      </View>

      {/* Pickup Window */}
      <View className="flex-1 flex-row items-center gap-1 px-3 py-[10px]">
        <View className="size-[30px] rounded-full bg-[rgba(249,199,79,0.1)] items-center justify-center">
          <CalendarIcon width={15} height={15} />
        </View>
        <View className="h-[44px] justify-center">
          <Text className="text-[12px] font-normal text-[#6c757d]">
            Pickup window
          </Text>
          <Text className="text-[14px] font-medium text-[#1a1a1a]">
            {pickupWindow}
          </Text>
        </View>
      </View>
    </View>
  );
}
