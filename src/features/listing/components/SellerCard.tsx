/**
 * SellerCard Component
 *
 * Green card with seller info and contact action buttons.
 * Matches Figma design node 142:4295.
 */

import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';

import PhoneIcon from '../../../../assets/icons/phone.svg';
import VideoIcon from '../../../../assets/icons/video.svg';
import ChatIcon from '../../../../assets/icons/chat.svg';

interface SellerCardProps {
  name: string;
  imageUrl?: string;
  onCallPress?: () => void;
  onVideoPress?: () => void;
  onChatPress?: () => void;
}

export function SellerCard({
  name,
  imageUrl,
  onCallPress,
  onVideoPress,
  onChatPress,
}: SellerCardProps) {
  return (
    <View className="w-full h-[96px] bg-[#e5f8ed] rounded-[10px] items-center justify-center">
      <View className="flex-row items-center gap-2">
        {/* Seller Image */}
        {imageUrl && (
          <View className="size-[47px] rounded-full overflow-hidden">
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </View>
        )}

        {/* Seller Info + Actions */}
        <View className="flex-row items-center gap-8">
          {/* Name + Role */}
          <View>
            <Text className="text-[22px] font-bold text-[#111a2c]">{name}</Text>
            <Text className="text-[14px] font-medium text-[#a0a5ba]">
              Seller
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center gap-[11px]">
            {/* Call Button */}
            <Pressable
              onPress={onCallPress}
              className="size-[45px] rounded-full bg-white items-center justify-center"
              style={{ borderWidth: 1, borderColor: '#60d394' }}
            >
              <PhoneIcon width={24} height={24} />
            </Pressable>

            {/* Video Button */}
            <Pressable
              onPress={onVideoPress}
              className="size-[45px] rounded-full bg-white items-center justify-center"
              style={{ borderWidth: 1, borderColor: '#60d394' }}
            >
              <VideoIcon width={24} height={24} />
            </Pressable>

            {/* Chat Button */}
            <Pressable
              onPress={onChatPress}
              className="size-[45px] rounded-full bg-white items-center justify-center"
              style={{ borderWidth: 1, borderColor: '#60d394' }}
            >
              <ChatIcon width={24} height={24} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
