import { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreen } from '@/components/onboarding';
import { useAuthStore } from '@/stores';

const ONBOARDING_COMPLETED_KEY = 'swuva-onboarding-completed';

export default function Splash() {
  const router = useRouter();
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const hasNavigatedRef = useRef(false);

  // Get auth state from store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  // Navigate when BOTH animation completes AND auth store is hydrated
  useEffect(() => {
    if (!isAnimationComplete || !isHydrated || hasNavigatedRef.current) return;

    hasNavigatedRef.current = true;

    const navigate = async () => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
        return;
      }

      try {
        const onboardingCompleted = await AsyncStorage.getItem(
          ONBOARDING_COMPLETED_KEY
        );

        if (onboardingCompleted === 'true') {
          router.replace('/(auth)/login');
          return;
        }
      } catch (e) {
        // ignore
      }

      router.replace('/onboarding');
    };

    void navigate();
  }, [isAnimationComplete, isHydrated, isAuthenticated, router]);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimationComplete(true);
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <SplashScreen onAnimationComplete={handleAnimationComplete} />
    </>
  );
}
