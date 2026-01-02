---
name: release-manager
description: App store deployment and release management. Use when deploying to TestFlight, Play Store, or managing releases. Handles EAS Build, EAS Submit, and OTA updates.
---

# Release Manager - App Store Deployment

## Overview

Manages the complete release lifecycle for iOS App Store and Google Play Store using EAS Build and EAS Submit.

## Quick Commands

```bash
# Development build
eas build --profile development --platform all

# Preview/TestFlight build
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android

# OTA update
eas update --branch production --message "Bug fixes"
```

## Release Workflow

### 1. Pre-Release Checklist

```bash
# Run all checks
npm run lint
npm run typecheck
npm test
npm run build # Verify build works
```

- [ ] All tests passing
- [ ] TypeScript has no errors
- [ ] Lint has no errors
- [ ] Manual QA completed
- [ ] Release notes written
- [ ] Version bumped

### 2. Version Bump

```ts
// app.config.ts
export default {
  version: '1.1.0',  // Semantic version
  ios: {
    buildNumber: '10',  // Increment for each build
  },
  android: {
    versionCode: 10,  // Increment for each build
  },
};
```

**Version Rules:**
- Major (1.0.0 → 2.0.0): Breaking changes
- Minor (1.0.0 → 1.1.0): New features
- Patch (1.0.0 → 1.0.1): Bug fixes

### 3. Build Production

```bash
# Build both platforms
eas build --profile production --platform all

# Or build separately
eas build --profile production --platform ios
eas build --profile production --platform android

# Check status
eas build:list
```

### 4. Submit to Stores

```bash
# Submit iOS to App Store Connect
eas submit --platform ios --profile production

# Submit Android to Play Console
eas submit --platform android --profile production

# Submit specific build
eas submit --platform ios --id <build-id>
```

### 5. Create Git Tag

```bash
git tag v1.1.0
git push origin v1.1.0
```

## iOS App Store Checklist

### Account Setup
- [ ] Apple Developer account ($99/year)
- [ ] App Store Connect app created
- [ ] Bundle ID registered
- [ ] Certificates configured (EAS handles this)

### App Metadata
- [ ] App name (max 30 chars)
- [ ] Subtitle (max 30 chars)
- [ ] Description (up to 4000 chars)
- [ ] Keywords (max 100 chars total)
- [ ] Support URL
- [ ] Privacy Policy URL
- [ ] Marketing URL (optional)

### Screenshots Required
| Device | Size | Required |
|--------|------|----------|
| iPhone 6.7" | 1290 x 2796 | Yes |
| iPhone 6.5" | 1284 x 2778 | Yes |
| iPhone 5.5" | 1242 x 2208 | Yes |
| iPad 12.9" | 2048 x 2732 | If iPad support |

### Compliance
- [ ] Age rating questionnaire
- [ ] App Privacy nutrition labels
- [ ] Export compliance (encryption)
- [ ] Content rights declaration

## Google Play Store Checklist

### Account Setup
- [ ] Play Developer account ($25 one-time)
- [ ] Play Console app created
- [ ] App signing by Google Play enabled

### Store Listing
- [ ] App name (max 50 chars)
- [ ] Short description (max 80 chars)
- [ ] Full description (max 4000 chars)
- [ ] Category selection
- [ ] Contact email

### Graphics Required
| Asset | Size | Required |
|-------|------|----------|
| App icon | 512 x 512 | Yes |
| Feature graphic | 1024 x 500 | Yes |
| Phone screenshots | Various | Min 2, Max 8 |
| Tablet 7" | Various | If tablet support |
| Tablet 10" | Various | If tablet support |

### Compliance
- [ ] Content rating questionnaire
- [ ] Data safety form
- [ ] Target audience declaration
- [ ] Privacy Policy URL

## OTA Updates

For JavaScript-only changes (no native code):

```bash
# Update preview channel
eas update --branch preview --message "Fix: Button alignment"

# Update production channel
eas update --branch production --message "Fix: Crash on checkout"

# Check update status
eas update:list
```

**When to use OTA:**
- Bug fixes (JS only)
- Text/copy changes
- Style changes
- Small feature tweaks

**When NOT to use OTA:**
- Native module changes
- Expo SDK upgrade
- New permissions
- App icon/splash changes

## Rollback Strategy

### OTA Rollback
```bash
# List recent updates
eas update:list --branch production

# Rollback to previous update
eas update:rollback --branch production
```

### Store Rollback
- iOS: Can't rollback, submit new version
- Android: Can rollback to previous APK in Play Console

## Release Notes Template

```markdown
## What's New in v1.1.0

### New Features
- Added dark mode support
- New payment options

### Improvements
- Faster listing load times
- Better location accuracy

### Bug Fixes
- Fixed crash when viewing empty cart
- Fixed notification badge count
```

## CI/CD Integration

### GitHub Actions - Release

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install deps
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build production
        run: eas build --profile production --platform all --non-interactive

      - name: Submit to stores
        run: |
          eas submit --platform ios --profile production --non-interactive
          eas submit --platform android --profile production --non-interactive
```

## Troubleshooting

### Build Failures

```bash
# Check build logs
eas build:view <build-id>

# Run diagnostics
eas diagnostics

# Clear cache and rebuild
eas build --profile production --clear-cache
```

### Submit Failures

**iOS:**
- Check App Store Connect for detailed errors
- Verify screenshots meet requirements
- Check privacy policy is accessible

**Android:**
- Check Play Console for review status
- Verify data safety form is complete
- Check for policy violations

### Common Issues

| Issue | Solution |
|-------|----------|
| Build timeout | Increase `resourceClass` in eas.json |
| Signing failed | Re-run `eas credentials` |
| Submit rejected | Check store dashboard for details |
| OTA not working | Verify `updates.url` in app.config |

## Reference

See `reference/ios-checklist.md` for detailed iOS requirements.
See `reference/android-checklist.md` for detailed Android requirements.
