/**
 * @jest-environment node
 */

import { getOrganizationAnalysisUsage } from './analytics.controller';
import { expect, describe, it, jest } from '@jest/globals';

describe('Analytics controller', () => {
  it('getOrganizationAnalysisUsage fails with invalid date', async () => {
    const req = {
      query: {
        startDate: '2024x01-01',
        endDate: '2024-01-02',
      },
    };
    const res = {
      status: (code) => {
        expect(code).toBe(400);
        return { send: jest.fn() };
      },
    };
    await getOrganizationAnalysisUsage(req, res);
  });
});
