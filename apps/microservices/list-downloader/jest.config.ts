/* eslint-disable */
export default {
  displayName: 'microservices-list-downloader',
  preset: '../../../jest.preset.js',
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/apps/microservices/list-downloader',
  collectCoverageFrom: ['./src/**/*.{js,jsx,ts,tsx}'],
  coverageReporters: ['json', 'text', 'lcov', 'clover', 'cobertura'],
};
