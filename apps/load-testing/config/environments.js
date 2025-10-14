/* global __ENV */

module.exports = {
  common: {
    baseUrl: __ENV.LOADTEST_BASE_URL || 'http://localhost:3333/api',
    apiKey: __ENV.LOADTEST_API_KEY || '',
    sleep: Number(__ENV.LOADTEST_SLEEP || 1),
    thresholds: {
      httpReqP95: Number(__ENV.LOADTEST_P95 || 800),
    },
  },
  dev: {
    smoke: {
      vus: Number(__ENV.LOADTEST_DEV_SMOKE_VUS || 1),
      duration: __ENV.LOADTEST_DEV_SMOKE_DURATION || '30s',
    },
    load: {
      startRate: Number(__ENV.LOADTEST_DEV_LOAD_START || 5),
      preAllocatedVUs: Number(__ENV.LOADTEST_DEV_LOAD_PREALLOC || 10),
      maxVUs: Number(__ENV.LOADTEST_DEV_LOAD_MAX || 20),
      stages: [{ duration: '2m', target: 10 }],
    },
  },
  staging: {
    smoke: {
      vus: Number(__ENV.LOADTEST_STG_SMOKE_VUS || 2),
      duration: __ENV.LOADTEST_STG_SMOKE_DURATION || '1m',
    },
    load: {
      startRate: Number(__ENV.LOADTEST_STG_LOAD_START || 20),
      preAllocatedVUs: Number(__ENV.LOADTEST_STG_LOAD_PREALLOC || 40),
      maxVUs: Number(__ENV.LOADTEST_STG_LOAD_MAX || 80),
      stages: [
        { duration: '2m', target: 40 },
        { duration: '5m', target: 40 },
        { duration: '2m', target: 0 },
      ],
    },
  },
  prod: {
    sleep: Number(__ENV.LOADTEST_PROD_SLEEP || 0.5),
    thresholds: {
      httpReqP95: Number(__ENV.LOADTEST_PROD_P95 || 500),
    },
    smoke: {
      vus: Number(__ENV.LOADTEST_PROD_SMOKE_VUS || 5),
      duration: __ENV.LOADTEST_PROD_SMOKE_DURATION || '1m',
    },
    load: {
      startRate: Number(__ENV.LOADTEST_PROD_LOAD_START || 50),
      preAllocatedVUs: Number(__ENV.LOADTEST_PROD_LOAD_PREALLOC || 100),
      maxVUs: Number(__ENV.LOADTEST_PROD_LOAD_MAX || 200),
      stages: [
        { duration: '5m', target: 100 },
        { duration: '10m', target: 100 },
        { duration: '5m', target: 0 },
      ],
    },
  },
};
