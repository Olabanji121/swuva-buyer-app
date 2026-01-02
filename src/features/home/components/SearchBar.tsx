/**
 * SearchBar Component
 *
 * Search input with settings/filter button.
 * Based on Figma design node 3:415.
 */

import { View, Text, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cn } from '@/lib/utils';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  onSettingsPress?: () => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onPress,
  onSettingsPress,
  placeholder = 'Search here. . .',
  editable = false,
  className,
}: SearchBarProps) {
  const Content = editable ? View : Pressable;

  return (
    <View className={cn('flex-row items-center gap-4 px-7', className)}>
      {/* Search Input */}
      <Content
        onPress={!editable ? onPress : undefined}
        className="flex-1 flex-row items-center gap-3 bg-[#fbfbfb] border border-[#ededed] rounded-[14px] px-4 py-3"
      >
        <Ionicons name="search" size={24} color="#808080" />
        {editable ? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#808080"
            className="flex-1 text-sm font-medium text-[#202226]"
          />
        ) : (
          <Text className="flex-1 text-sm font-medium text-[#808080]">
            {placeholder}
          </Text>
        )}
      </Content>

      {/* Settings/Filter Button */}
      <Pressable
        onPress={onSettingsPress}
        className="w-12 h-12 items-center justify-center border border-[#ededed] rounded-full"
      >
        <Ionicons name="options-outline" size={24} color="#212121" />
      </Pressable>
    </View>
  );
}
