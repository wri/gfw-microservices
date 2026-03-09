// Automatically retry flaky tests up to 2 times
jest.retryTimes(2);

// Increase default test timeout from 5s to 120s for e2e tests
jest.setTimeout(120000);
