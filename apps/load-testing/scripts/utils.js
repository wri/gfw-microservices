/* global __ENV */

import defaultConfig from '../config/environments.js';

const DEFAULT_ENV = 'dev';

export function resolveConfig() {
  const env = __ENV.ENVIRONMENT || DEFAULT_ENV;
  const base = Object.assign({}, defaultConfig.common || {}, defaultConfig[env] || {});
  return applyEnvOverrides(base);
}

function applyEnvOverrides(settings) {
  const result = Object.assign({}, settings);

  if (__ENV.LOADTEST_BASE_URL) {
    result.baseUrl = __ENV.LOADTEST_BASE_URL;
  }

  if (__ENV.LOADTEST_API_KEY) {
    result.apiKey = __ENV.LOADTEST_API_KEY;
  }

  if (__ENV.LOADTEST_SLEEP) {
    result.sleep = Number(__ENV.LOADTEST_SLEEP);
  }

  if (__ENV.LOADTEST_P95) {
    result.thresholds = result.thresholds || {};
    result.thresholds.httpReqP95 = Number(__ENV.LOADTEST_P95);
  }

  return result;
}
