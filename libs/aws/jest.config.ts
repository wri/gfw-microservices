/* eslint-disable */
export default {
  displayName: 'aws',
  preset: '../../jest.preset.js',
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
  coverageDirectory: '../../coverage/libs/aws',
  collectCoverageFrom: ['./src/**/*.{js,jsx,ts,tsx}'],
  coverageReporters: ['json', 'text', 'lcov', 'clover', 'cobertura'],
};
