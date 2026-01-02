/**
 * FilterModal Component
 *
 * Bottom sheet modal for filtering products by distance, price,
 * pickup time, and dietary preferences.
 * Matches Figma design node 84:7300 with iOS 26 liquid glass enhancement.
 */

import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import {
  LiquidGlassView,
  isLiquidGlassSupported,
} from '@callstack/liquid-glass';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FilterSlider } from '@/components/ui/FilterSlider';
import { FilterChip } from '@/components/ui/FilterChip';
import CloseIcon from '../../../../assets/icons/close.svg';

export interface FilterValues {
  distance: number;
  maxPrice: number;
  pickupWithin: number;
  dietaryPreferences: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Lactose free',
];

const DEFAULT_VALUES: FilterValues = {
  distance: 2,
  maxPrice: 20,
  pickupWithin: 4,
  dietaryPreferences: [],
};

export function FilterModal({
  visible,
  onClose,
  onApply,
  initialValues,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  const handleDistanceChange = useCallback((value: number) => {
    setFilters((prev) => ({ ...prev, distance: value }));
  }, []);

  const handleMaxPriceChange = useCallback((value: number) => {
    setFilters((prev) => ({ ...prev, maxPrice: value }));
  }, []);

  const handlePickupWithinChange = useCallback((value: number) => {
    setFilters((prev) => ({ ...prev, pickupWithin: value }));
  }, []);

  const toggleDietaryPreference = useCallback((preference: string) => {
    setFilters((prev) => {
      const isSelected = prev.dietaryPreferences.includes(preference);
      return {
        ...prev,
        dietaryPreferences: isSelected
          ? prev.dietaryPreferences.filter((p) => p !== preference)
          : [...prev.dietaryPreferences, preference],
      };
    });
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_VALUES);
  }, []);

  const handleApply = useCallback(() => {
    onApply(filters);
    onClose();
  }, [filters, onApply, onClose]);

  // Close button with liquid glass
  const CloseButton = isLiquidGlassSupported ? (
    <Pressable onPress={onClose}>
      <LiquidGlassView
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        effect="clear"
        interactive
      >
        <CloseIcon width={16} height={16} />
      </LiquidGlassView>
    </Pressable>
  ) : (
    <Pressable
      onPress={onClose}
      className="size-10 items-center justify-center rounded-full border border-[#ededed]"
    >
      <CloseIcon width={16} height={16} />
    </Pressable>
  );

  // Reset button - matches Figma: #f8f9fa bg with 0.667px border
  const ResetButton = (
    <Pressable
      onPress={handleReset}
      className="flex-1 h-12 items-center justify-center rounded-[8px]"
      style={{
        backgroundColor: '#f8f9fa',
        borderWidth: 0.667,
        borderColor: '#dee2e6',
      }}
    >
      <Text className="text-[14px] font-medium text-[#212529]">Reset</Text>
    </Pressable>
  );

  // Apply button with liquid glass
  const ApplyButton = isLiquidGlassSupported ? (
    <Pressable onPress={handleApply} className="flex-1">
      <LiquidGlassView
        style={{
          height: 48,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        effect="regular"
        interactive
        tintColor="#60d394"
      >
        <Text className="text-sm font-medium text-white">Apply Filters</Text>
      </LiquidGlassView>
    </Pressable>
  ) : (
    <Pressable
      onPress={handleApply}
      className="flex-1 h-12 items-center justify-center rounded-lg"
      style={{ backgroundColor: '#60d394' }}
    >
      <Text className="text-[14px] font-medium text-white">Apply Filters</Text>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/30">
        <View className="bg-white rounded-t-3xl">
          {/* Header - Figma: 0.667px bottom border */}
          <View
            className="flex-row items-center justify-between px-[30px] py-5"
            style={{ borderBottomWidth: 0.667, borderBottomColor: '#dee2e6' }}
          >
            <Text className="text-[16px] font-semibold text-[#212529]">
              Filters
            </Text>
            {CloseButton}
          </View>

          {/* Content */}
          <ScrollView
            className="px-[30px] py-5"
            showsVerticalScrollIndicator={false}
          >
            {/* Distance Slider */}
            <FilterSlider
              label="Distance"
              value={filters.distance}
              min={1}
              max={50}
              step={1}
              unit=" km"
              onValueChange={handleDistanceChange}
              className="mb-8"
            />

            {/* Max Price Slider */}
            <FilterSlider
              label="Max Price"
              value={filters.maxPrice}
              min={1}
              max={100}
              step={1}
              prefix="$"
              onValueChange={handleMaxPriceChange}
              className="mb-8"
            />

            {/* Pickup Within Slider */}
            <FilterSlider
              label="Pickup within"
              value={filters.pickupWithin}
              min={1}
              max={24}
              step={1}
              unit=" hours"
              onValueChange={handlePickupWithinChange}
              className="mb-8"
            />

            {/* Dietary Preferences */}
            <View className="mb-6">
              <Text className="text-base font-normal text-[#212529] mb-3">
                Dietary Preferences
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {DIETARY_OPTIONS.map((option) => (
                  <FilterChip
                    key={option}
                    label={option}
                    selected={filters.dietaryPreferences.includes(option)}
                    onPress={() => toggleDietaryPreference(option)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer with buttons - Figma: 0.667px top border */}
          <View
            className="flex-row gap-5 px-[30px] py-5"
            style={{ borderTopWidth: 0.667, borderTopColor: '#dee2e6' }}
          >
            {ResetButton}
            {ApplyButton}
          </View>
        </View>
      </View>
    </Modal>
  );
}
