/* eslint-disable */
export default {
  displayName: 'microservices-list-processing',
  preset: '../../../jest.preset.js',
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
  coverageDirectory: '../../../coverage/apps/microservices/list-processing',
  setupFilesAfterEnv: ['./jest.setup.ts'],
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
