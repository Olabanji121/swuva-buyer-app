import { ExpoConfig, ConfigContext } from 'expo/config';

const APP_ENV = process.env.APP_ENV || 'development';

const envConfig = {
  development: {
    apiUrl: 'http://localhost:7079',
    name: 'Swuva (Dev)',
    bundleId: 'com.swuva.buyer.dev',
  },
  preview: {
    apiUrl: 'https://staging-api.swuva.com',
    name: 'Swuva (Preview)',
    bundleId: 'com.swuva.buyer.preview',
  },
  production: {
    apiUrl: 'https://api.swuva.com',
    name: 'Swuva',
    bundleId: 'com.swuva.buyer',
  },
};

const config = envConfig[APP_ENV as keyof typeof envConfig];

export default ({ config: expoConfig }: ConfigContext): ExpoConfig => ({
  ...expoConfig,
  name: config.name,
  slug: 'swuva-buyer',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'swuva',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#10b981',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: config.bundleId,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'We need your location to show nearby food listings.',
      NSCameraUsageDescription: 'We need camera access for profile photos.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#10b981',
    },
    package: config.bundleId,
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'CAMERA'],
    edgeToEdgeEnabled: true,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-local-authentication',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Swuva to use your location to find nearby food.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow Swuva to access your photos.',
        cameraPermission: 'Allow Swuva to access your camera.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl: config.apiUrl,
    appEnv: APP_ENV,
    eas: {
      projectId: process.env.EAS_PROJECT_ID || 'your-eas-project-id',
    },
  },
  updates: {
    url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID || 'your-eas-project-id'}`,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
});
