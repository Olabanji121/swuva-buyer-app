---
name: expo-dev
description: Core Expo/React Native development patterns for Swuva Buyer app. Use when building features, components, hooks, or stores. Provides architecture guidance, component patterns, and state management.
---

# Expo Development - Swuva Buyer App

## Overview

Mobile app for consumers to discover and purchase surplus food from local businesses. Built with Expo SDK 53+, React Native New Architecture, and TypeScript.

## Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | Expo SDK 53+ | React Native with New Architecture |
| Routing | Expo Router 4.x | File-based navigation |
| Styling | NativeWind 4.x | Tailwind CSS for React Native |
| Client State | Zustand 5.x | Lightweight state management |
| Server State | TanStack Query 5.x | Data fetching, caching |
| Forms | React Hook Form + Zod | Type-safe validation |
| Lists | @shopify/flash-list | High-performance lists |
| Images | expo-image | Optimized image loading |
| Animation | react-native-reanimated 3.x | 60fps native animations |

## Project Structure

```
swuva_buyer_app/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Unauthenticated routes
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── onboarding/
│   ├── (tabs)/             # Main app tabs
│   │   ├── index.tsx       # Home/Nearby
│   │   ├── search.tsx
│   │   ├── orders.tsx
│   │   └── profile.tsx
│   ├── listing/[id].tsx
│   ├── cart/
│   └── _layout.tsx
├── src/
│   ├── components/
│   │   ├── ui/             # Base components
│   │   ├── listings/
│   │   ├── cart/
│   │   └── shared/
│   ├── features/           # Feature modules
│   │   ├── auth/
│   │   ├── listings/
│   │   ├── cart/
│   │   └── orders/
│   ├── lib/                # Utilities
│   ├── hooks/              # Shared hooks
│   ├── stores/             # Zustand stores
│   ├── types/
│   └── constants/
├── assets/
└── __tests__/
```

## Component Pattern

Use CVA (class-variance-authority) for variant-based styling:

```tsx
// src/components/ui/Button.tsx
import { forwardRef } from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-xl active:opacity-80',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-secondary',
        outline: 'border-2 border-primary bg-transparent',
        ghost: 'bg-transparent',
        destructive: 'bg-destructive',
      },
      size: {
        sm: 'h-10 px-4',
        md: 'h-12 px-6',
        lg: 'h-14 px-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

interface ButtonProps extends PressableProps, VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  loading?: boolean;
}

export const Button = forwardRef<View, ButtonProps>(
  ({ className, variant, size, children, loading, onPress, ...props }, ref) => {
    const handlePress = (e) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.(e);
    };

    return (
      <Pressable
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        onPress={handlePress}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : typeof children === 'string' ? (
          <Text className="font-semibold text-primary-foreground">{children}</Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);
```

## Feature Hook Pattern

```tsx
// src/features/listings/hooks/useNearbyListings.ts
import { useQuery } from '@tanstack/react-query';
import { useLocationStore } from '@/stores/location.store';
import { listingsService } from '../services/listings.service';

export function useNearbyListings(options = {}) {
  const { radius = 5, category, enabled = true } = options;
  const { latitude, longitude } = useLocationStore();

  return useQuery({
    queryKey: ['listings', 'nearby', { latitude, longitude, radius, category }],
    queryFn: () => listingsService.getNearby({ latitude, longitude, radius, category }),
    enabled: enabled && !!latitude && !!longitude,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

## Zustand Store Pattern

```tsx
// src/stores/cart.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartState {
  items: CartItem[];
  sellerId: string | null;
  addItem: (listing: Listing, quantity: number) => void;
  removeItem: (listingId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sellerId: null,

      addItem: (listing, quantity) => {
        const { items, sellerId } = get();
        // Clear cart if different seller
        if (sellerId && sellerId !== listing.sellerId) {
          set({ items: [{ listing, quantity }], sellerId: listing.sellerId });
          return;
        }
        // Add or update item
        const existing = items.findIndex(i => i.listing.id === listing.id);
        if (existing > -1) {
          const newItems = [...items];
          newItems[existing].quantity += quantity;
          set({ items: newItems });
        } else {
          set({ items: [...items, { listing, quantity }], sellerId: listing.sellerId });
        }
      },

      removeItem: (id) => {
        const items = get().items.filter(i => i.listing.id !== id);
        set({ items, sellerId: items.length ? get().sellerId : null });
      },

      clearCart: () => set({ items: [], sellerId: null }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.listing.price * i.quantity, 0),
    }),
    { name: 'swuva-cart', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

## API Service Pattern

```tsx
// src/features/listings/services/listings.service.ts
import { api } from '@/lib/api';
import type { Listing, NearbyParams } from '../types';

export const listingsService = {
  getNearby: async (params: NearbyParams): Promise<Listing[]> => {
    const { data } = await api.get('/buyer/listings/nearby', { params });
    return data.data;
  },

  getById: async (id: string): Promise<Listing> => {
    const { data } = await api.get(`/buyer/listings/${id}`);
    return data.data;
  },

  search: async (query: string, filters?: SearchFilters): Promise<Listing[]> => {
    const { data } = await api.get('/buyer/listings/search', {
      params: { query, ...filters },
    });
    return data.data;
  },
};
```

## Screen Pattern (Expo Router)

```tsx
// app/(tabs)/index.tsx
import { View, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNearbyListings } from '@/features/listings/hooks/useNearbyListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export default function HomeScreen() {
  const { data: listings, isLoading, error, refetch } = useNearbyListings();

  if (isLoading) return <ListingSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!listings?.length) return <EmptyState message="No listings nearby" />;

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={listings}
        renderItem={({ item }) => <ListingCard listing={item} />}
        estimatedItemSize={200}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
      />
    </View>
  );
}
```

## Commands

```bash
npx expo start          # Start dev server
npx expo start -c       # Clear cache
npx expo run:ios        # Run iOS
npx expo run:android    # Run Android
npm test                # Run tests
```

## Reference Files

For detailed implementation guides, see:
- `reference/security.md` - Authentication, secure storage, API security
- `reference/testing.md` - Jest, RTL, Maestro E2E patterns
- `reference/deployment.md` - EAS Build, app store submission
- `reference/performance.md` - Optimization techniques

## Code Templates

Copy-ready templates in `templates/` folder:
- `component.tsx` - UI component with variants
- `hook.ts` - TanStack Query hook
- `store.ts` - Zustand store with persistence
- `service.ts` - API service module
