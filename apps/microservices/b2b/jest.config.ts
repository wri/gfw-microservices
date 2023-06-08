/* eslint-disable */
export default {
  displayName: 'microservices-b2b',
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
  collectCoverageFrom: ['./src/**/*.{js,jsx,ts,tsx}'],
  coverageDirectory: '../../../coverage/apps/microservices/b2b',
  coverageReporters: ['json', 'text', 'lcov', 'clover', 'cobertura'],
};
