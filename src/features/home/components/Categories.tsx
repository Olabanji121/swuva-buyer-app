/**
 * Categories Component
 *
 * Horizontal category selector with local SVG icons.
 * Based on Figma design node 37:60353.
 */

import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { cn } from '@/lib/utils';
import type { Category, CategoryItem } from '../types';

interface CategoriesProps {
  categories: CategoryItem[];
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  className?: string;
}

export function Categories({
  categories,
  selectedCategory,
  onSelectCategory,
  className,
}: CategoriesProps) {
  const handlePress = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectCategory(category);
  };

  return (
    <View
      className={cn(
        'mx-7 bg-white rounded-[10px] py-5 px-4',
        className
      )}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <View className="flex-row justify-between">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const IconComponent = category.IconComponent;

          return (
            <Pressable
              key={category.id}
              onPress={() => handlePress(category.id)}
              className="items-center gap-2"
            >
              <View
                className={cn(
                  'w-[60px] h-[60px] items-center justify-center rounded-xl border',
                  isSelected
                    ? 'bg-primary/10 border-primary'
                    : 'bg-white border-[#d5d5d5]'
                )}
                style={{ borderWidth: 0.3 }}
              >
                {IconComponent ? (
                  <IconComponent width={32} height={32} />
                ) : (
                  <Ionicons
                    name={(category.icon as any) || 'grid-outline'}
                    size={28}
                    color={isSelected ? '#60d394' : '#838383'}
                  />
                )}
              </View>
              <Text
                className={cn(
                  'text-sm font-medium text-center',
                  isSelected ? 'text-primary' : 'text-[#838383]'
                )}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
