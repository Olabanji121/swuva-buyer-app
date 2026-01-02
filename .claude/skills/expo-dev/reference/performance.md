# Performance Optimization Guide

## Core Principles

1. **Use New Architecture** (SDK 53+ default)
2. **Use Hermes** engine (default)
3. **FlashList** over FlatList
4. **expo-image** over Image
5. **Reanimated** for animations

## List Optimization

### FlashList

```tsx
import { FlashList } from '@shopify/flash-list';

function ListingsGrid({ listings }: { listings: Listing[] }) {
  const renderItem = useCallback(
    ({ item }: { item: Listing }) => <ListingCard listing={item} />,
    []
  );

  return (
    <FlashList
      data={listings}
      renderItem={renderItem}
      estimatedItemSize={200}  // Required! Measure your items
      numColumns={2}
      keyExtractor={(item) => item.id}
      // Performance props
      drawDistance={250}  // Pre-render distance
      overrideItemLayout={(layout, item, index, maxColumns) => {
        layout.size = 200;  // Known item size
      }}
    />
  );
}
```

### Avoiding Re-renders

```tsx
// Memoize components
const ListingCard = memo(function ListingCard({ listing, onPress }) {
  return (
    <Pressable onPress={() => onPress(listing)}>
      {/* ... */}
    </Pressable>
  );
});

// Memoize callbacks
const handlePress = useCallback((listing) => {
  router.push(`/listing/${listing.id}`);
}, []);

// Memoize expensive computations
const sortedListings = useMemo(() => {
  return [...listings].sort((a, b) => a.distance - b.distance);
}, [listings]);
```

## Image Optimization

### expo-image

```tsx
import { Image } from 'expo-image';

// Generate blurhash for placeholder (do this server-side)
const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

function OptimizedImage({ uri }: { uri: string }) {
  return (
    <Image
      source={{ uri }}
      style={{ width: '100%', aspectRatio: 1 }}
      contentFit="cover"
      transition={200}
      placeholder={blurhash}
      cachePolicy="memory-disk"  // Cache aggressively
      recyclingKey={uri}  // For list recycling
    />
  );
}
```

### Image Preloading

```tsx
import { Image } from 'expo-image';

// Preload images before navigation
async function preloadListingImages(listings: Listing[]) {
  const urls = listings.slice(0, 10).map(l => l.imageUrl);
  await Promise.all(urls.map(url => Image.prefetch(url)));
}
```

## Animation Performance

### Use Reanimated (runs on UI thread)

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

function AnimatedCard({ children }: { children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    opacity.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1, { duration: 100 });
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
```

### Gesture-driven Animations

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

function SwipeableCard({ onSwipe }: { onSwipe: () => void }) {
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 100) {
        translateX.value = withSpring(e.translationX > 0 ? 300 : -300);
        runOnJS(onSwipe)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        {/* Content */}
      </Animated.View>
    </GestureDetector>
  );
}
```

## Data Fetching Optimization

### TanStack Query Configuration

```tsx
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      gcTime: 1000 * 60 * 30,    // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,  // Mobile doesn't need this
      refetchOnReconnect: true,
    },
  },
});
```

### Prefetching

```tsx
// Prefetch on screen focus
useFocusEffect(
  useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['listings', 'nearby'],
      queryFn: () => listingsService.getNearby(location),
    });
  }, [location])
);

// Prefetch on hover/touch
const handleListingPress = (listing: Listing) => {
  // Navigate immediately
  router.push(`/listing/${listing.id}`);

  // Prefetch related data
  queryClient.prefetchQuery({
    queryKey: ['seller', listing.sellerId],
    queryFn: () => sellersService.getById(listing.sellerId),
  });
};
```

### Infinite Queries

```tsx
function useInfiniteListings() {
  return useInfiniteQuery({
    queryKey: ['listings', 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      listingsService.getPage({ offset: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length * 20 : undefined,
    staleTime: 1000 * 60 * 5,
  });
}
```

## Bundle Size Optimization

### Analyze Bundle

```bash
# Generate bundle stats
npx expo export --dump-sourcemap

# Analyze with source-map-explorer
npx source-map-explorer dist/_expo/static/js/*.js
```

### Code Splitting

```tsx
// Lazy load heavy screens
import { lazy, Suspense } from 'react';

const MapScreen = lazy(() => import('./MapScreen'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MapScreen />
    </Suspense>
  );
}
```

### Tree Shaking

```tsx
// Bad - imports entire library
import _ from 'lodash';
_.debounce(fn, 300);

// Good - imports only what's needed
import debounce from 'lodash/debounce';
debounce(fn, 300);

// Better - use native
import { useMemo } from 'react';
const debouncedFn = useMemo(
  () => debounce(fn, 300),
  [fn]
);
```

## Memory Management

### Cleanup Effects

```tsx
useEffect(() => {
  const subscription = someEmitter.subscribe(handler);
  const timer = setInterval(poll, 5000);

  return () => {
    subscription.unsubscribe();
    clearInterval(timer);
  };
}, []);
```

### Image Cleanup

```tsx
import { Image } from 'expo-image';

// Clear cache when needed
async function clearImageCache() {
  await Image.clearDiskCache();
  await Image.clearMemoryCache();
}
```

## Performance Checklist

Before release:

- [ ] All lists use FlashList with estimatedItemSize
- [ ] All images use expo-image with caching
- [ ] Heavy components wrapped in React.memo
- [ ] Callbacks wrapped in useCallback
- [ ] Expensive computations wrapped in useMemo
- [ ] Animations use Reanimated (not Animated)
- [ ] Bundle size analyzed and optimized
- [ ] No console.log in production
- [ ] Hermes enabled
- [ ] New Architecture enabled

## Measuring Performance

```tsx
// Use React DevTools Profiler
// Use Flipper for detailed profiling
// Use expo-performance for metrics

import * as Performance from 'expo-performance';

Performance.mark('screen-render-start');
// ... render
Performance.mark('screen-render-end');
Performance.measure('screen-render', 'screen-render-start', 'screen-render-end');
```
