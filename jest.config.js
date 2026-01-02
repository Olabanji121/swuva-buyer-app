/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest for TypeScript transformation
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|nativewind|react-native-reanimated|react-native-css-interop)',
  ],
  moduleNameMapper: {
    // Template component mappings (specific paths first)
    '^@/components/useColorScheme$': '<rootDir>/components/useColorScheme',
    '^@/components/useClientOnlyValue$': '<rootDir>/components/useClientOnlyValue',
    '^@/components/EditScreenInfo$': '<rootDir>/components/EditScreenInfo',
    '^@/components/Themed$': '<rootDir>/components/Themed',
    '^@/constants/Colors$': '<rootDir>/constants/Colors',
    // Default path mapping (src directory)
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock react-native for node environment
    '^react-native$': '<rootDir>/node_modules/react-native',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  testEnvironment: 'node',
  clearMocks: true,
  // Resolve react-native to the correct module
  resolver: undefined,
};
