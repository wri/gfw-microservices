/**
 * @jest-environment node
 */

import { expect, describe, it, jest } from '@jest/globals';

jest.mock('../../../config/privateutils/logger.utils', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('mssql', () => ({
  Int: 'mockInt',
}));

jest.mock('../../../config/config', () => ({
  default: {
    SQLConnection: { database: 'test_db' },
    compiledAssets: { js: {}, css: {} },
    platformVars: {
      authenticationStatus: {},
    },
  },
}));

jest.mock('date-fns', () => ({
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  differenceInDays: jest.fn(() => 365),
  format: jest.fn(() => '2024-01-01'),
}));

jest.mock('../../vectorTiles/utils/vectorTile.utils', () => ({
  getCurrentDateTimeFormatted: jest.fn(() => '20240101_120000'),
}));

jest.mock('../../downloader', () => ({
  sendMessageToQueue: jest.fn(() => ({ success: true })),
}));

jest.mock('../../../config/publicutils/userManager.utils', () => ({
  isProManager: jest.fn(() => false),
}));

jest.mock('@wri-monorepos/shared', () => ({
  getAccountExtraLimits: jest.fn().mockResolvedValue({}),
  getAccountSubscriptionLimits: jest.fn().mockResolvedValue({}),
  combineOrganizationLimits: jest.fn().mockReturnValue({}),
  getAccountUsagePercentage: jest.fn().mockResolvedValue(0),
  getAccountRolloverLimits: jest.fn().mockResolvedValue({}),
}));

jest.mock('@wri-monorepos/constants', () => ({
  analysisTypes: {
    TYPE1: 'type1',
    TYPE2: 'type2',
  },
}));

jest.mock('@wri-monorepos/sql', () => ({
  SQLUtils: {
    queryDBFirstRow: jest.fn().mockResolvedValue({
      organizationDb: 'mock_organization_database',
    }),
  },
  getAccountUsersAnalysisUsage: jest.fn().mockResolvedValue([]),
  getAccountRenewalTime: jest.fn().mockResolvedValue(new Date()),
  getAccountAnalysisLimits: jest.fn().mockResolvedValue({}),
  getAccountAnalysisUsage: jest.fn().mockResolvedValue({}),
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
      session: {
        organization_database: 'test_org_db',
      },
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
