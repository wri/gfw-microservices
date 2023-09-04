import axios from 'axios';
/**
 * Omit E2E tests for now
 * remove the x from xdescribe to run the test
 * remove the x from xit to run the test
 */

describe('GET /api/HealthCheck', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api/HealthCheck`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual('Healthy');
  });
});
