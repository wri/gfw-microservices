/* eslint-disable */
export default {
  displayName: 'externalapi-e2e',
  preset: '../../../jest.preset.js',
  globalSetup: '<rootDir>/src/support/global-setup.ts',
  globalTeardown: '<rootDir>/src/support/global-teardown.ts',
  setupFiles: ['<rootDir>/src/support/test-setup.ts', '<rootDir>/jest.set.env.ts'],
  setupAfterEnv: ['<rootDir>/src/support/jest-after-env.ts'],
  testEnvironment: 'node',
  maxWorkers: 1, // Run tests serially to avoid circular JSON serialization issues
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@digitalbazaar|base58-universal|base64url-universal|@stablelib|crypto-ld)/)',
  ],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/externalapi-e2e',
};
