# Swuva Buyer App - Project Instructions

## Overview

This is the **Swuva Buyer** mobile app built with Expo (React Native). It allows consumers to discover and purchase surplus food from local businesses.

## Quick Start

```bash
# Install dependencies
npm install

# Start development
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Skills

The comprehensive Expo development skill is available at:
- `.claude/skills/expo-dev.md`

This skill covers:
- Project structure and architecture
- Component patterns
- Security implementation
- Testing strategy
- Performance optimization
- App store deployment
- CI/CD pipeline
- Figma to code workflow

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Expo SDK 53+ |
| Routing | Expo Router 4.x |
| Styling | NativeWind (Tailwind) |
| State | Zustand + TanStack Query |
| Forms | React Hook Form + Zod |
| Lists | @shopify/flash-list |
| Images | expo-image |
| Animation | react-native-reanimated |

## Backend API

The app connects to the Swuva API backend:
- Development: `http://localhost:7079`
- Production: `https://api.swuva.com`

API documentation: `http://localhost:7079/docs`

## Key Directories

```
app/                 # Expo Router screens
src/components/      # UI components
src/features/        # Feature modules
src/lib/             # Utilities
src/stores/          # Zustand stores
```

## Development Guidelines

1. **Always use TypeScript** - No `any` types
2. **Use NativeWind** - Tailwind classes for styling
3. **Feature-based structure** - Group related code together
4. **Secure storage** - Use expo-secure-store for tokens
5. **FlashList for lists** - Never use FlatList
6. **expo-image** - Always use for images

## Testing

```bash
npm test              # Unit tests
npm test -- --watch   # Watch mode
maestro test e2e/     # E2E tests
```

## Deployment

```bash
eas build --profile preview      # Internal testing
eas build --profile production   # App store release
eas submit --platform ios        # Submit to App Store
eas submit --platform android    # Submit to Play Store
```

## Security Checklist

Before any release:
- [ ] All tokens in secure storage
- [ ] No hardcoded secrets
- [ ] HTTPS only
- [ ] Input validation
- [ ] Debug logs disabled
