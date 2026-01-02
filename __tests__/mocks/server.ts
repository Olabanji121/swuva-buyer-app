import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server for Node.js (Jest)
export const server = setupServer(...handlers);

// Enable API mocking before tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that are declared during tests
afterEach(() => server.resetHandlers());

// Clean up after all tests are done
afterAll(() => server.close());
