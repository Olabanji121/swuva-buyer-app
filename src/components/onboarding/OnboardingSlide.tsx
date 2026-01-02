import { View, Text, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import type { OnboardingSlide as OnboardingSlideType } from '@/constants/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlideProps {
  slide: OnboardingSlideType;
}

export function OnboardingSlide({ slide }: OnboardingSlideProps) {
  return (
    <View style={{ width: SCREEN_WIDTH }} className="flex-1 items-center px-6">
      {/* Background decorative circles */}
      <View className="absolute top-[15%] -right-[10%] w-[200px] h-[200px] rounded-full bg-primary/5" />
      <View className="absolute top-[8%] right-[20%] w-[280px] h-[280px] rounded-full bg-primary/5" />
      <View className="absolute bottom-[35%] -left-[15%] w-[350px] h-[350px] rounded-full bg-primary/5" />
      <View className="absolute bottom-[45%] -left-[5%] w-[180px] h-[180px] rounded-full bg-primary/5" />

      {/* Lottie Animation */}
      <View className="flex-1 items-center justify-center pt-16">
        <View className="relative">
          {/* Decorative blob behind animation */}
          <View className="absolute -inset-8 bg-primary/10 rounded-[100px] rotate-12" />
          <LottieView
            source={{ uri: slide.lottieSource }}
            autoPlay
            loop
            style={{ width: 320, height: 320 }}
          />
        </View>
      </View>

      {/* Text Content */}
      <View className="items-center pb-8 px-4">
        <Text className="text-[28px] font-semibold text-[#363A33] text-center leading-tight mb-4">
          {slide.title}
        </Text>
        <Text className="text-base text-[#60655C] text-center leading-relaxed">
          {slide.description}
        </Text>
      </View>
    </View>
  );
}
