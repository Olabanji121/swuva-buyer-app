---
name: mobile-testing
description: Mobile app testing automation for React Native/Expo. Use when writing unit tests, component tests, or E2E tests with Maestro. Generates tests following project patterns.
---

# Mobile Testing - Test Automation

## Overview

Comprehensive testing for Expo/React Native apps using Jest, React Native Testing Library, MSW, and Maestro for E2E.

## Test Types

| Type | Tool | Location | Purpose |
|------|------|----------|---------|
| Unit | Jest | `__tests__/` | Functions, utils, stores |
| Component | RNTL | `__tests__/components/` | UI components |
| Hook | RNTL | `__tests__/hooks/` | Custom hooks |
| Integration | MSW | `__tests__/` | API integration |
| E2E | Maestro | `e2e/flows/` | User flows |

## Commands

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Specific file
npm test -- ListingCard

# E2E tests
maestro test e2e/flows/

# Single E2E flow
maestro test e2e/flows/auth.yaml
```

## Unit Test Template

```tsx
// __tests__/utils/formatPrice.test.ts
import { formatPrice, formatDiscount } from '@/lib/utils';

describe('formatPrice', () => {
  it('formats price with 2 decimal places', () => {
    expect(formatPrice(10)).toBe('$10.00');
    expect(formatPrice(10.5)).toBe('$10.50');
    expect(formatPrice(10.99)).toBe('$10.99');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('handles large numbers', () => {
    expect(formatPrice(1000)).toBe('$1,000.00');
  });
});

describe('formatDiscount', () => {
  it('calculates discount percentage', () => {
    expect(formatDiscount(10, 20)).toBe('50%');
    expect(formatDiscount(8.99, 15.99)).toBe('44%');
  });

  it('returns 0% when prices are equal', () => {
    expect(formatDiscount(10, 10)).toBe('0%');
  });
});
```

## Store Test Template

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
    // Reset store before each test
    useCartStore.getState().clearCart();
  });

  describe('addItem', () => {
    it('adds item to empty cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockListing, 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.sellerId).toBe('seller-1');
    });

    it('increments quantity for existing item', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockListing, 1);
        result.current.addItem(mockListing, 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
    });

    it('clears cart when adding from different seller', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockListing, 1);
        result.current.addItem(
          { ...mockListing, id: '2', sellerId: 'seller-2' },
          1
        );
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.sellerId).toBe('seller-2');
    });
  });

  describe('computed values', () => {
    it('calculates totalItems correctly', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockListing, 2);
        result.current.addItem({ ...mockListing, id: '2' }, 3);
      });

      expect(result.current.totalItems()).toBe(5);
    });

    it('calculates totalPrice correctly', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(mockListing, 2); // 2 x 10.99 = 21.98
      });

      expect(result.current.totalPrice()).toBeCloseTo(21.98);
    });
  });
});
```

## Component Test Template

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
};

describe('ListingCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders listing information', () => {
    render(<ListingCard listing={mockListing} onPress={mockOnPress} />);

    expect(screen.getByText('Fresh Salad Box')).toBeTruthy();
    expect(screen.getByText('$8.99')).toBeTruthy();
    expect(screen.getByText('Green Cafe')).toBeTruthy();
    expect(screen.getByText('1.2 km')).toBeTruthy();
  });

  it('displays discount badge', () => {
    render(<ListingCard listing={mockListing} onPress={mockOnPress} />);

    // 8.99 / 15.99 ≈ 44% off
    expect(screen.getByText(/44% OFF/i)).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    render(<ListingCard listing={mockListing} onPress={mockOnPress} />);

    fireEvent.press(screen.getByTestId('listing-card'));

    expect(mockOnPress).toHaveBeenCalledWith(mockListing);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('truncates long names', () => {
    const longNameListing = {
      ...mockListing,
      name: 'This is a very long listing name that should be truncated',
    };

    render(<ListingCard listing={longNameListing} onPress={mockOnPress} />);

    const nameText = screen.getByTestId('listing-name');
    expect(nameText.props.numberOfLines).toBe(1);
  });
});
```

## Hook Test Template

```tsx
// __tests__/hooks/useNearbyListings.test.tsx
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNearbyListings } from '@/features/listings/hooks/useNearbyListings';
import { useLocationStore } from '@/stores/location.store';

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useNearbyListings', () => {
  beforeEach(() => {
    // Set mock location
    useLocationStore.setState({
      latitude: -33.8688,
      longitude: 151.2093,
    });
  });

  it('fetches listings when location available', async () => {
    const { result } = renderHook(() => useNearbyListings(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for success
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('does not fetch when location unavailable', () => {
    useLocationStore.setState({ latitude: null, longitude: null });

    const { result } = renderHook(() => useNearbyListings(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('respects radius parameter', async () => {
    const { result } = renderHook(() => useNearbyListings({ radius: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify the query was made with correct params
    // (MSW handler should validate this)
  });
});
```

## Maestro E2E Template

```yaml
# e2e/flows/auth.yaml
appId: com.swuva.buyer
---
# Test: User can sign in successfully
- launchApp:
    clearState: true

# Navigate to sign in
- tapOn: "Sign In"

# Fill credentials
- tapOn:
    id: "email-input"
- inputText: "test@example.com"

- tapOn:
    id: "password-input"
- inputText: "Password123!"

# Submit
- tapOn:
    id: "sign-in-button"

# Verify success
- assertVisible: "Nearby"
- assertVisible:
    id: "listings-grid"
```

```yaml
# e2e/flows/browse-and-cart.yaml
appId: com.swuva.buyer
---
# Prerequisites: User is signed in
- runFlow: auth.yaml

# Browse listings
- assertVisible:
    id: "listings-grid"

# Tap first listing
- tapOn:
    id: "listing-card-0"

# Verify listing detail
- assertVisible:
    id: "listing-detail"
- assertVisible: "Add to Cart"

# Add to cart
- tapOn: "Add to Cart"
- assertVisible: "Added to cart"

# Go to cart
- tapOn:
    id: "cart-tab"

# Verify cart
- assertVisible: "Your Cart"
- assertVisible:
    id: "cart-item-0"
- assertVisible: "Checkout"
```

```yaml
# e2e/flows/checkout.yaml
appId: com.swuva.buyer
---
# Prerequisites: Item in cart
- runFlow: browse-and-cart.yaml

# Start checkout
- tapOn: "Checkout"

# Verify checkout screen
- assertVisible: "Payment"

# (Payment flow would continue here)
# Note: Use test payment methods in E2E
```

## MSW Handlers

```tsx
// __tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

const API = 'https://api.swuva.com/api/v1';

export const handlers = [
  // Listings
  http.get(`${API}/buyer/listings/nearby`, ({ request }) => {
    const url = new URL(request.url);
    const radius = url.searchParams.get('radius') || '5';

    return HttpResponse.json({
      success: true,
      data: [
        { id: '1', name: 'Fresh Salad', price: 8.99, sellerId: 's1' },
        { id: '2', name: 'Bakery Box', price: 5.99, sellerId: 's2' },
      ],
    });
  }),

  http.get(`${API}/buyer/listings/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { id: params.id, name: 'Test Listing', price: 9.99 },
    });
  }),

  // Auth
  http.post(`${API}/auth/sign-in`, async ({ request }) => {
    const body = await request.json();

    if (body.email === 'test@example.com') {
      return HttpResponse.json({
        success: true,
        data: {
          user: { id: '1', email: body.email },
          accessToken: 'mock-token',
        },
      });
    }

    return HttpResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  }),
];
```

## Coverage Requirements

| Metric | Target |
|--------|--------|
| Branches | 70% |
| Functions | 70% |
| Lines | 80% |
| Statements | 80% |

## What to Test

**Always test:**
- Store actions and computed values
- Custom hooks with async logic
- Form validation
- Error handling
- User interactions

**Skip testing:**
- Simple pass-through components
- Third-party wrappers
- Static content

## Reference

See `reference/jest-patterns.md` for advanced patterns.
See `reference/maestro-flows.md` for more E2E examples.
