/**
 * @jest-environment node
 */

import { expect, describe, it, jest } from '@jest/globals';
jest.mock('@wri-monorepos/sql', () => ({
  SQLUtils: {
    queryDBFirstRow: jest.fn().mockResolvedValue({
      organizationDb: 'mock_organization_database',
    }),
  },
  getAccountAnalysisUsageByAnalysisType: jest.fn().mockResolvedValue({}),
}));
import {
  getOrganizationAnalysisUsage,
  getMyAccountAnalysisUsageByAnalysisType,
} from './analytics.controller';

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

  it('getMyAccountAnalysisUsageByAnalysisType reads query params', async () => {
    const req = {
      query: {
        startDate: '2024-01-01',
        endDate: '2024-03-02',
        organizationId: 123,
      },
      session: {},
    };
    const res = {
      status: (code) => {
        expect(code).toBe(200);
        return { send: jest.fn() };
      },
    };
    await getMyAccountAnalysisUsageByAnalysisType(req, res);
  });
});
