// Basic test setup
// Note: For component tests using @testing-library/react-native,
// you may need to add additional mocks for expo modules

// Global test utilities
global.testUtils = {
  mockUser: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'BUYER',
  },
  mockLocation: {
    latitude: -33.8688,
    longitude: 151.2093,
  },
};
