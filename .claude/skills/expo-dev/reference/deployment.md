# Deployment Guide

## EAS Configuration

```json
// eas.json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "APP_ENV": "development" }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false },
      "env": { "APP_ENV": "preview" },
      "channel": "preview"
    },
    "production": {
      "env": { "APP_ENV": "production" },
      "channel": "production",
      "ios": { "resourceClass": "m1-medium" },
      "android": { "buildType": "apk" }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEF1234"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

## App Configuration

```ts
// app.config.ts
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
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#10b981',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: config.bundleId,
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'Show nearby food listings.',
      NSCameraUsageDescription: 'Take profile photos.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#10b981',
    },
    package: config.bundleId,
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'CAMERA'],
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-local-authentication',
    ['expo-location', { locationAlwaysAndWhenInUsePermission: 'Allow location access.' }],
    ['expo-image-picker', { photosPermission: 'Access photos.', cameraPermission: 'Access camera.' }],
  ],
  experiments: { typedRoutes: true },
  extra: {
    apiUrl: config.apiUrl,
    appEnv: APP_ENV,
    eas: { projectId: 'your-eas-project-id' },
  },
  updates: { url: 'https://u.expo.dev/your-eas-project-id' },
  runtimeVersion: { policy: 'appVersion' },
});
```

## Build Commands

```bash
# Development build (with dev client)
eas build --profile development --platform all

# Preview build (internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Build specific platform
eas build --profile production --platform ios
eas build --profile production --platform android

# Check build status
eas build:list
```

## Submit Commands

```bash
# Submit to App Store
eas submit --platform ios --profile production

# Submit to Google Play
eas submit --platform android --profile production

# Submit specific build
eas submit --platform ios --id <build-id>
```

## OTA Updates

```bash
# Push update to preview channel
eas update --branch preview --message "Bug fixes"

# Push update to production
eas update --branch production --message "Performance improvements"

# Check update status
eas update:list
```

## iOS App Store Checklist

**Account Setup:**
- [ ] Apple Developer account ($99/year)
- [ ] App Store Connect app created
- [ ] Bundle ID registered

**App Metadata:**
- [ ] App name (max 30 characters)
- [ ] Subtitle (max 30 characters)
- [ ] Description (up to 4000 characters)
- [ ] Keywords (max 100 characters total)
- [ ] Support URL
- [ ] Privacy Policy URL
- [ ] Copyright info

**Visual Assets:**
- [ ] App icon 1024x1024 (no alpha/transparency)
- [ ] Screenshots 6.7" (1290x2796) - iPhone 15 Pro Max
- [ ] Screenshots 6.5" (1284x2778) - iPhone 14 Plus
- [ ] Screenshots 5.5" (1242x2208) - iPhone 8 Plus
- [ ] iPad screenshots 12.9" (2048x2732) - if supporting iPad

**Compliance:**
- [ ] Age rating questionnaire
- [ ] App Privacy nutrition labels
- [ ] Export compliance (encryption)
- [ ] Content rights declaration

## Google Play Store Checklist

**Account Setup:**
- [ ] Google Play Developer account ($25 one-time)
- [ ] Play Console app created
- [ ] App signing by Google Play enabled

**Store Listing:**
- [ ] App name (max 50 characters)
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] Category selection
- [ ] Contact email

**Visual Assets:**
- [ ] App icon 512x512
- [ ] Feature graphic 1024x500
- [ ] Phone screenshots (min 2, max 8)
- [ ] 7" tablet screenshots (if supporting)
- [ ] 10" tablet screenshots (if supporting)

**Compliance:**
- [ ] Content rating questionnaire
- [ ] Data safety form
- [ ] Target audience declaration
- [ ] Privacy Policy URL

## Version Management

```bash
# Bump version in app.config.ts
# version: "1.0.0" -> "1.1.0"

# For iOS, also update buildNumber
# For Android, also update versionCode

# Create git tag
git tag v1.1.0
git push origin v1.1.0
```

## Release Workflow

1. **Prepare release branch**
   ```bash
   git checkout -b release/1.1.0
   ```

2. **Update version**
   - Update `version` in app.config.ts
   - Update `buildNumber` (iOS) / `versionCode` (Android)

3. **Run tests**
   ```bash
   npm test
   npm run typecheck
   npm run lint
   ```

4. **Build production**
   ```bash
   eas build --profile production --platform all
   ```

5. **Submit to stores**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

6. **Create release**
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```
