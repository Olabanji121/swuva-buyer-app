import { StatusBar } from 'expo-status-bar';
import { OnboardingScreen } from '@/components/onboarding';

export default function Onboarding() {
  // Onboarding navigates to tabs after completion
  // When auth screens are added, this will navigate to /(auth)/login instead
  // The splash screen checks auth state - if logged in, it skips onboarding

  return (
    <>
      <StatusBar style="dark" />
      <OnboardingScreen />
    </>
  );
}
