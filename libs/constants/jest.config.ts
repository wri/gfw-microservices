/* eslint-disable */
export default {
  displayName: 'constants',
  preset: '../../jest.preset.js',
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
  coverageDirectory: '../../coverage/libs/constants',
  collectCoverageFrom: ['./src/**/*.{js,jsx,ts,tsx}'],
  coverageReporters: ['json', 'text', 'lcov', 'clover', 'cobertura'],
};
