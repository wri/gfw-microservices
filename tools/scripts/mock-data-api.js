#!/usr/bin/env node
/**
 * Local mock of the GFW Data API for manually verifying the GADMService
 * circuit breaker. Alternates between a FAIL phase (HTTP 504) and an OK
 * phase (HTTP 200 with the same mock payload used by gadm.service.spec.ts)
 * so you can watch the breaker open, half-open, and close repeatedly.
 * Every response is delayed by RESPONSE_DELAY_MS to imitate real latency.
 *
 * Usage:
 *   node tools/scripts/mock-data-api.js
 *   PORT=8888 FAIL_MS=15000 OK_MS=15000 RESPONSE_DELAY_MS=300 \
 *     node tools/scripts/mock-data-api.js
 *
 * To point the microservice at it, temporarily change the URL in
 * apps/microservices/list-processing/src/app/list-upload/chain/gadm.service.ts
 * to `http://localhost:${PORT}/` and then `npm run start:lp`.
 * Revert the URL before committing.
 */

const http = require('http');

const PORT = Number(process.env.PORT || 8888);
const FAIL_MS = Number(process.env.FAIL_MS || 15_000);
const OK_MS = Number(process.env.OK_MS || 15_000);
const RESPONSE_DELAY_MS = Number(process.env.RESPONSE_DELAY_MS || 300);

const startedAt = Date.now();
let requestCount = 0;

const mockPayload = {
  data: [
    {
      gid_1: '123',
      gid_2: '456',
      name_0: 'Country',
      name_1: 'State',
      name_2: 'Substate',
    },
  ],
};

function currentPhase() {
  const cycle = FAIL_MS + OK_MS;
  const positionInCycle = (Date.now() - startedAt) % cycle;
  if (positionInCycle < FAIL_MS) {
    return { name: 'FAIL', wave: Math.floor((Date.now() - startedAt) / cycle) + 1 };
  }
  return { name: 'OK', wave: Math.floor((Date.now() - startedAt) / cycle) + 1 };
}

const server = http.createServer((req, res) => {
  requestCount += 1;
  const reqNum = requestCount;

  // Drain request body; some clients won't send 'end' until body is consumed.
  req.on('data', () => undefined);
  req.on('end', () => {
    const phase = currentPhase();

    setTimeout(() => {
      const tMs = Date.now() - startedAt;
      if (phase.name === 'FAIL') {
        res.statusCode = 504;
        res.setHeader('content-type', 'text/plain');
        res.end('gateway timeout (mock)');
        console.log(`[${tMs}ms] wave ${phase.wave} #${reqNum} ${req.method} ${req.url} -> 504`);
        return;
      }
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(mockPayload));
      console.log(`[${tMs}ms] wave ${phase.wave} #${reqNum} ${req.method} ${req.url} -> 200`);
    }, RESPONSE_DELAY_MS);
  });
});

server.listen(PORT, () => {
  console.log(`mock data-api listening on http://localhost:${PORT}`);
  console.log(
    `waves: ${FAIL_MS}ms FAIL -> ${OK_MS}ms OK -> repeat. response delay: ${RESPONSE_DELAY_MS}ms`
  );
});

process.on('SIGINT', () => {
  console.log(`\nshutting down. served ${requestCount} request(s).`);
  server.close(() => process.exit(0));
});
