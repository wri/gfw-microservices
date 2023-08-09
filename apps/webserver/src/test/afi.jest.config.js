module.exports = {
  displayName: 'afi-test-coverage',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  roots: ['<rootDir>../'],
  collectCoverageFrom: ['<rootDir>/client/eudr/*.{js,jsx,ts,tsx}'],
  coverageDirectory: '../../../coverage/apps/webserver',
  coverageReporters: ['json', 'text', 'lcov', 'clover', 'cobertura'],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
