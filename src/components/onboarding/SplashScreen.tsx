import { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation sequence
    Animated.sequence([
      // Fade in and scale up logo
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Fade in text
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Hold for a moment
      Animated.delay(1500),
    ]).start(() => {
      onAnimationComplete?.();
    });
  }, [fadeAnim, scaleAnim, textFadeAnim, onAnimationComplete]);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      {/* Background decorative circles */}
      <View className="absolute top-[15%] -right-[10%] w-[200px] h-[200px] rounded-full bg-primary/5" />
      <View className="absolute top-[8%] right-[20%] w-[280px] h-[280px] rounded-full bg-primary/5" />
      <View className="absolute bottom-[10%] -left-[15%] w-[350px] h-[350px] rounded-full bg-primary/5" />
      <View className="absolute bottom-[20%] -left-[5%] w-[180px] h-[180px] rounded-full bg-primary/5" />

      {/* Logo animation */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        <LottieView
          source={{
            uri: 'https://lottie.host/d3e6fc60-9db1-4977-b0b6-4d7f98272192/hKPpG4XJK0.json',
          }}
          autoPlay
          loop={false}
          style={{ width: 180, height: 180 }}
          // Fallback to static logo if Lottie fails
          onAnimationFailure={() => {}}
        />

        {/* Swuva Logo SVG representation */}
        <View className="w-[140px] h-[140px] items-center justify-center -mt-4">
          <View className="absolute w-[120px] h-[120px] rounded-full bg-primary" />
          <View className="absolute w-[60px] h-[60px] rounded-full bg-[#E8F5E1] -top-1 left-2 rotate-[-20deg]" />
          <View className="absolute w-[50px] h-[50px] rounded-full bg-[#FEF9A7] top-2 -left-1 rotate-[30deg]" />
        </View>
      </Animated.View>

      {/* SWUVA text */}
      <Animated.View style={{ opacity: textFadeAnim }} className="mt-6">
        <Text className="text-primary text-4xl font-bold tracking-[8px]">
          SWUVA
        </Text>
      </Animated.View>

      {/* Small decorative dot */}
      <View className="absolute bottom-[25%] left-1/2 w-3 h-3 rounded-full bg-gray-200 -ml-1.5" />
    </View>
  );
}
