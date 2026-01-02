import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:7079/api/v1';

// Mock data
export const mockListings = [
  {
    id: '1',
    title: 'Fresh Sourdough Bread',
    description: 'Artisan sourdough, baked today',
    price: 5.99,
    originalPrice: 12.0,
    quantity: 3,
    category: 'bakery',
    seller: {
      id: 'seller-1',
      name: 'Local Bakery',
      rating: 4.8,
    },
    pickupStart: '17:00',
    pickupEnd: '19:00',
    distance: 0.5,
    image: 'https://example.com/bread.jpg',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Mixed Salad Box',
    description: 'Fresh garden salad with dressing',
    price: 4.5,
    originalPrice: 9.0,
    quantity: 5,
    category: 'prepared',
    seller: {
      id: 'seller-2',
      name: 'Green Cafe',
      rating: 4.5,
    },
    pickupStart: '18:00',
    pickupEnd: '20:00',
    distance: 1.2,
    image: 'https://example.com/salad.jpg',
    createdAt: new Date().toISOString(),
  },
];

export const mockUser = {
  id: 'user-1',
  email: 'buyer@example.com',
  name: 'Test Buyer',
  role: 'BUYER',
  createdAt: new Date().toISOString(),
};

// Request handlers
export const handlers = [
  // Auth handlers
  http.post(`${API_URL}/auth/sign-in`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'buyer@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        user: mockUser,
        session: {
          token: 'mock-session-token',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });
    }

    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_URL}/auth/sign-up`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      name: string;
    };

    return HttpResponse.json({
      user: {
        id: 'new-user-id',
        email: body.email,
        name: body.name,
        role: 'BUYER',
        createdAt: new Date().toISOString(),
      },
    });
  }),

  http.get(`${API_URL}/auth/get-session`, () => {
    return HttpResponse.json({
      user: mockUser,
      session: {
        token: 'mock-session-token',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  }),

  http.post(`${API_URL}/auth/sign-out`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Listings handlers
  http.get(`${API_URL}/buyer/listings/nearby`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    let listings = mockListings;
    if (category) {
      listings = mockListings.filter((l) => l.category === category);
    }

    return HttpResponse.json({
      listings,
      total: listings.length,
      page: 1,
      limit: 20,
    });
  }),

  http.get(`${API_URL}/buyer/listings/:id`, ({ params }) => {
    const listing = mockListings.find((l) => l.id === params.id);

    if (!listing) {
      return HttpResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ listing });
  }),

  // Cart handlers
  http.get(`${API_URL}/buyer/cart`, () => {
    return HttpResponse.json({
      items: [],
      total: 0,
    });
  }),

  http.post(`${API_URL}/buyer/cart/add`, async ({ request }) => {
    const body = (await request.json()) as { listingId: string; quantity: number };

    const listing = mockListings.find((l) => l.id === body.listingId);
    if (!listing) {
      return HttpResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      items: [
        {
          id: 'cart-item-1',
          listing,
          quantity: body.quantity,
        },
      ],
      total: listing.price * body.quantity,
    });
  }),

  // Orders handlers
  http.get(`${API_URL}/buyer/orders`, () => {
    return HttpResponse.json({
      orders: [],
      total: 0,
    });
  }),

  http.post(`${API_URL}/buyer/orders`, () => {
    return HttpResponse.json({
      order: {
        id: 'order-1',
        status: 'CONFIRMED',
        total: 10.49,
        createdAt: new Date().toISOString(),
      },
    });
  }),
];
