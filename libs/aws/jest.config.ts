/* eslint-disable */
export default {
  displayName: 'aws',
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
  coverageDirectory: '../../coverage/libs/aws',
  collectCoverageFrom: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  coverageReporters: [
    "json",
    "text",
    "lcov",
    "clover",
    "cobertura"
  ],
};
