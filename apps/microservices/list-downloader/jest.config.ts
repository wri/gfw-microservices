/* eslint-disable */
export default {
  displayName: 'microservices-list-downloader',
  preset: '../../../jest.preset.js',
  setupFiles: ['<rootDir>/jest.set.env.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/apps/microservices/list-downloader',
  collectCoverageFrom: ['./src/**/*.{js,jsx,ts,tsx}'],
  coverageReporters: ['json', 'text', 'lcov', 'clover', 'cobertura'],
};
