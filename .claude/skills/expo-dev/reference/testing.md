# Testing Strategy Guide

## Overview

| Type | Tool | Purpose |
|------|------|---------|
| Unit | Jest | Functions, utilities, stores |
| Component | React Native Testing Library | UI components |
| Integration | MSW | API mocking |
| E2E | Maestro | Full user flows |

## Jest Configuration

```js
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },
};
```

```js
// jest.setup.js
import '@testing-library/react-native/extend-expect';
import { server } from './__tests__/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
```

## Unit Test Pattern

```tsx
// __tests__/stores/cart.store.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useCartStore } from '@/stores/cart.store';

const mockListing = {
  id: '1',
  sellerId: 'seller-1',
  name: 'Test Item',
  price: 10.99,
};

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockListing, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems()).toBe(2);
    expect(result.current.totalPrice()).toBe(21.98);
  });

  it('should increment quantity for existing item', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockListing, 1);
      result.current.addItem(mockListing, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
  });

  it('should clear cart when adding from different seller', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockListing, 1);
      result.current.addItem({ ...mockListing, id: '2', sellerId: 'seller-2' }, 1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.sellerId).toBe('seller-2');
  });
});
```

## Component Test Pattern

```tsx
// __tests__/components/ListingCard.test.tsx
import { render, fireEvent, screen } from '@testing-library/react-native';
import { ListingCard } from '@/components/listings/ListingCard';

const mockListing = {
  id: '1',
  name: 'Fresh Salad Box',
  price: 8.99,
  originalPrice: 15.99,
  imageUrl: 'https://example.com/image.jpg',
  seller: { name: 'Green Cafe' },
  distance: 1.2,
  pickupWindow: { start: '17:00', end: '19:00' },
};

describe('ListingCard', () => {
  it('renders listing information correctly', () => {
    render(<ListingCard listing={mockListing} onPress={jest.fn()} />);

    expect(screen.getByText('Fresh Salad Box')).toBeTruthy();
    expect(screen.getByText('$8.99')).toBeTruthy();
    expect(screen.getByText('Green Cafe')).toBeTruthy();
    expect(screen.getByText('1.2 km')).toBeTruthy();
  });

  it('shows discount percentage', () => {
    render(<ListingCard listing={mockListing} onPress={jest.fn()} />);

    // 8.99 / 15.99 = ~44% off
    expect(screen.getByText(/44% off/i)).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<ListingCard listing={mockListing} onPress={onPress} />);

    fireEvent.press(screen.getByTestId('listing-card'));

    expect(onPress).toHaveBeenCalledWith(mockListing);
  });

  it('displays pickup window', () => {
    render(<ListingCard listing={mockListing} onPress={jest.fn()} />);

    expect(screen.getByText('5:00 PM - 7:00 PM')).toBeTruthy();
  });
});
```

## Hook Test Pattern

```tsx
// __tests__/hooks/useNearbyListings.test.tsx
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNearbyListings } from '@/features/listings/hooks/useNearbyListings';
import { useLocationStore } from '@/stores/location.store';

const wrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useNearbyListings', () => {
  beforeEach(() => {
    useLocationStore.setState({ latitude: -33.8688, longitude: 151.2093 });
  });

  it('fetches listings when location is available', async () => {
    const { result } = renderHook(() => useNearbyListings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
  });

  it('does not fetch when location is unavailable', () => {
    useLocationStore.setState({ latitude: null, longitude: null });

    const { result } = renderHook(() => useNearbyListings(), { wrapper });

    expect(result.current.isFetching).toBe(false);
  });
});
```

## MSW API Mocking

```tsx
// __tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

const API_URL = 'https://api.swuva.com/api/v1';

export const handlers = [
  // Listings
  http.get(`${API_URL}/buyer/listings/nearby`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Fresh Salad Box',
          price: 8.99,
          sellerId: 'seller-1',
        },
        {
          id: '2',
          name: 'Bakery Surprise Bag',
          price: 5.99,
          sellerId: 'seller-2',
        },
      ],
    });
  }),

  http.get(`${API_URL}/buyer/listings/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        name: 'Test Listing',
        price: 9.99,
      },
    });
  }),

  // Auth
  http.post(`${API_URL}/auth/sign-in`, async ({ request }) => {
    const body = await request.json();

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    }

    return HttpResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Orders
  http.get(`${API_URL}/buyer/orders`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),
];
```

```tsx
// __tests__/mocks/server.ts
import { setupServer } from 'msw/native';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

## Test Commands

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Specific file
npm test -- ListingCard

# Update snapshots
npm test -- -u
```

## Coverage Requirements

| Metric | Minimum |
|--------|---------|
| Branches | 70% |
| Functions | 70% |
| Lines | 80% |
| Statements | 80% |

## What to Test

**Always test:**
- Store actions and computed values
- Custom hooks with async logic
- Form validation
- API error handling
- User interactions (press, input)

**Skip testing:**
- Simple pass-through components
- Third-party library wrappers
- Static content
