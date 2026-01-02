import { useRef, useState, useCallback } from 'react';
import { View, FlatList, Dimensions, ViewToken } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Button } from '@/components/ui/Button';
import { OnboardingSlide } from './OnboardingSlide';
import { Pagination } from './Pagination';
import { ONBOARDING_SLIDES } from '@/constants/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_COMPLETED_KEY = 'swuva-onboarding-completed';

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    } catch (e) {
      // ignore
    }
    onComplete?.();
    router.replace('/(auth)/login');
  }, [onComplete, router]);

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isLastSlide) {
      void completeOnboarding();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  }, [completeOnboarding, currentIndex, isLastSlide]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void completeOnboarding();
  }, [completeOnboarding]);

  return (
    <View className="flex-1 bg-white">
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={({ item }) => <OnboardingSlide slide={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Bottom Controls */}
      <View className="px-6 pb-12 pt-4 gap-4">
        {/* Pagination */}
        <Pagination total={ONBOARDING_SLIDES.length} current={currentIndex} />

        {/* Buttons */}
        <View className="flex-row gap-2">
          <Button
            variant="secondary"
            size="lg"
            onPress={handleSkip}
            className="flex-none"
          >
            Skip
          </Button>

          <Button
            variant="primary"
            size="lg"
            onPress={handleNext}
            className="flex-1"
          >
            {isLastSlide ? 'Get Started' : 'Next'}
          </Button>
        </View>
      </View>
    </View>
  );
}
