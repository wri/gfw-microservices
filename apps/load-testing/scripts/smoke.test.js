/* global __ENV */

import exec from 'k6/execution';
import http from 'k6/http';
import { check, sleep } from 'k6';

import { resolveConfig } from './utils.js';

const cfg = resolveConfig();
const HEALTH_PATH = __ENV.LOADTEST_HEALTH_PATH || '/HealthCheck';

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: cfg.smoke.vus,
      duration: cfg.smoke.duration,
    },
  },
  thresholds: {
    http_req_duration: [`p(95)<${cfg.thresholds.httpReqP95}`],
    checks: ['rate>0.99'],
  },
};

export default function smokeTest() {
  const res = http.get(`${cfg.baseUrl}${HEALTH_PATH}`);

  check(res, {
    'status 2xx or 3xx': (r) => r.status >= 200 && r.status < 400,
  });

  if (cfg.sleep) {
    sleep(cfg.sleep);
  }

  if (__ENV.DEBUG) {
    console.log(`[smoke] iteration ${exec.vu.iterationInScenario + 1}`);
  }
}
