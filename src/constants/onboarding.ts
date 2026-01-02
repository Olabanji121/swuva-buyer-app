export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  lottieSource: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Save surplus food nearby',
    description:
      'Discover delicious food from local businesses before it goes to waste',
    // Foodie girl animation (from Figma design)
    lottieSource:
      'https://lottie.host/d3e6fc60-9db1-4977-b0b6-4d7f98272192/hKPpG4XJK0.json',
  },
  {
    id: '2',
    title: 'Enjoy great deals',
    description:
      'Get quality meals at up to 70% off from cafes, restaurants, and bakeries',
    // Food delivery animation
    lottieSource:
      'https://lottie.host/5d6a6fed-3c63-4a53-b2df-3e6f13df8c4e/g7G1ZGVG8m.json',
  },
  {
    id: '3',
    title: 'Help the environment',
    description:
      'Every meal you save helps reduce food waste and protects our planet',
    // Eco/sustainability animation
    lottieSource:
      'https://lottie.host/15a15d13-f4cd-4e2d-87c3-82a7dc0d9fdf/CMQmBM4qQ7.json',
  },
  {
    id: '4',
    title: 'Pick up with ease',
    description:
      'Collect your food at a time that works for you from nearby locations',
    // Location/map animation
    lottieSource:
      'https://lottie.host/ea7459f2-4fbb-4f87-a6d6-bb9ec2f0ca3b/sXueBk8c7N.json',
  },
];
