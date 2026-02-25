/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-var-requires */

import express from 'express';
const request = require('supertest');

// Mock path.resolve used inside routes to point to the real config directory
jest.mock('path', () => {
  const actualPath = jest.requireActual('path');
  const baseDir = actualPath.resolve(__dirname, '../../../config');

  return {
    ...actualPath,
    resolve: jest.fn((p: string) => {
      if (p && typeof p === 'string' && p.startsWith('./config/')) {
        const rel = p.substring('./config/'.length);
        return actualPath.resolve(baseDir, rel);
      }
      return actualPath.resolve(p);
    }),
  };
});

// Mock logger
jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

// Mock config
jest.mock('../../../config/config', () => ({
  __esModule: true,
  default: {
    SQLConnection: { database: 'test_db' },
    compiledAssets: { js: {}, css: {} },
  },
}));

// Mock mssql
jest.mock('mssql', () => ({
  Int: 'mockInt',
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  differenceInDays: jest.fn(() => 365),
  format: jest.fn(() => '2024-01-01'),
}));

// Mock vectorTile utils
jest.mock('../../vectorTiles/utils/vectorTile.utils', () => ({
  getCurrentDateTimeFormatted: jest.fn(() => '20240101_120000'),
}));

// Mock SQL utilities
jest.mock('@wri-monorepos/sql', () => ({
  SQLUtils: {
    queryDBFirstRow: jest.fn(),
  },
  getAccountUsersAnalysisUsage: jest.fn(),
  getAccountRenewalTime: jest.fn().mockResolvedValue('2025-01-01'),
  getAccountAnalysisLimits: jest.fn(),
  getAccountAnalysisUsage: jest.fn(),
  getAccountAnalysisUsageByAnalysisType: jest.fn(),
}));

// Mock shared utilities
jest.mock('@wri-monorepos/shared', () => ({
  getAccountExtraLimits: jest.fn(),
  getAccountSubscriptionLimits: jest.fn(),
  combineOrganizationLimits: jest.fn(),
  getAccountUsagePercentage: jest.fn(),
  getAccountRolloverLimits: jest.fn(),
}));

// Mock downloader
jest.mock('../../downloader', () => ({
  sendMessageToQueue: jest.fn().mockReturnValue('queue-message-id'),
}));

// Mock UserManager
jest.mock('../../../config/publicutils/userManager.utils', () => ({
  isProManager: jest.fn(),
}));

// Middlewares and rate limiter
jest.mock('../../../config/publicutils/middlewares', () => ({
  checkProManagerAuthentication: (_req: unknown, _res: unknown, next: () => void) => next(),
  checkAuthentication: (_req: unknown, _res: unknown, next: () => void) => next(),
  checkOrganization: (_req: unknown, _res: unknown, next: () => void) => next(),
  checkActive: (_req: unknown, _res: unknown, next: () => void) => next(),
  checkInactivity: (_req: unknown, _res: unknown, next: () => void) => next(),
  rateLimitAuthenticated: {},
}));

jest.mock('../../../config/lib/limiter-util', () => ({
  useRateLimiter: jest.fn(() => false),
}));

const UserManager = require('../../../config/publicutils/userManager.utils');
const { sendMessageToQueue } = require('../../downloader');
const { SQLUtils } = require('@wri-monorepos/sql');
const logger = require('../../../config/privateutils/logger.utils');

const registerRoutes = require('../routes/analytics.routes');

const buildApp = () => {
  const app = express();
  app.use(express.json());

  // Mock session middleware
  app.use((req: any, _res, next) => {
    req.session = {
      organization_database: 'test_org_db',
      user_email: 'test@example.com',
      organization_id: 100,
    };
    next();
  });

  registerRoutes(app, jest.fn());
  return app;
};

describe('analytics.routes - downloadOrganizationUsersUsageExport', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();

    // Default mocks
    SQLUtils.queryDBFirstRow.mockResolvedValue({ organizationDb: 'target_org_db' });
    sendMessageToQueue.mockReturnValue('queue-message-id');
  });

  describe('Pro Manager authentication', () => {
    it('should return 400 when Pro Manager does not provide orgId', async () => {
      UserManager.isProManager.mockReturnValue(true);

      const res = await request(app).get('/analytics/usage/users/download');

      expect(res.status).toBe(400);
      expect(res.body.message.error).toBe('orgId parameter is required for Pro Managers.');
      expect(res.body.message.success).toBe(false);
    });

    it('should return 400 when orgId is not a valid integer', async () => {
      UserManager.isProManager.mockReturnValue(true);

      const res = await request(app).get('/analytics/usage/users/download?orgId=abc');

      expect(res.status).toBe(400);
      expect(res.body.message.error).toBe('orgId must be a valid positive integer.');
      expect(res.body.message.success).toBe(false);
    });

    it('should return 400 when orgId is zero', async () => {
      UserManager.isProManager.mockReturnValue(true);

      const res = await request(app).get('/analytics/usage/users/download?orgId=0');

      expect(res.status).toBe(400);
      expect(res.body.message.error).toBe('orgId must be a valid positive integer.');
      expect(res.body.message.success).toBe(false);
    });

    it('should return 400 when orgId is negative', async () => {
      UserManager.isProManager.mockReturnValue(true);

      const res = await request(app).get('/analytics/usage/users/download?orgId=-5');

      expect(res.status).toBe(400);
      expect(res.body.message.error).toBe('orgId must be a valid positive integer.');
      expect(res.body.message.success).toBe(false);
    });

    it('should allow Pro Manager to export for another org with valid orgId', async () => {
      UserManager.isProManager.mockReturnValue(true);

      const res = await request(app).get(
        '/analytics/usage/users/download?orgId=200&startDate=2024-01-01&endDate=2024-12-31'
      );

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(SQLUtils.queryDBFirstRow).toHaveBeenCalledWith(
        'test_db',
        'getOrganizationDb',
        expect.arrayContaining([
          expect.objectContaining({
            field: 'organizationId',
            value: 200,
          }),
        ])
      );
      expect(sendMessageToQueue).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationDatabase: 'target_org_db',
          userEmail: 'test@example.com',
        }),
        'accountUsersUsage'
      );
    });

    it('should allow Pro Manager to export for their own org', async () => {
      UserManager.isProManager.mockReturnValue(true);

      const res = await request(app).get('/analytics/usage/users/download?orgId=100');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Non-Pro Manager authentication', () => {
    it('should return 403 when non-Pro Manager tries to access another org data', async () => {
      UserManager.isProManager.mockReturnValue(false);

      const res = await request(app).get('/analytics/usage/users/download?orgId=200');

      expect(res.status).toBe(403);
      expect(res.body.message.error).toBe(
        "Unauthorized: Only Pro Managers can access other organizations' data."
      );
      expect(res.body.message.success).toBe(false);
    });

    it('should allow non-Pro Manager to export for their own org via myorg route', async () => {
      UserManager.isProManager.mockReturnValue(false);

      const res = await request(app).get('/analytics/myorg/usage/users/download');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(sendMessageToQueue).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationDatabase: 'test_org_db',
          userEmail: 'test@example.com',
        }),
        'accountUsersUsage'
      );
    });

    it('should allow non-Pro Manager to export without orgId param', async () => {
      UserManager.isProManager.mockReturnValue(false);

      const res = await request(app).get('/analytics/myorg/usage/users/download');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should return 500 when database query fails', async () => {
      UserManager.isProManager.mockReturnValue(true);
      SQLUtils.queryDBFirstRow.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/analytics/usage/users/download?orgId=200');

      expect(res.status).toBe(500);
      expect(res.body.message.error).toBe('Internal server error.');
      expect(res.body.message.success).toBe(false);
    });

    it('should return 500 when sendMessageToQueue fails', async () => {
      UserManager.isProManager.mockReturnValue(false);
      sendMessageToQueue.mockImplementation(() => {
        throw new Error('Queue error');
      });

      const res = await request(app).get('/analytics/myorg/usage/users/download');

      expect(res.status).toBe(500);
      expect(res.body.message.error).toBe('Internal server error.');
      expect(res.body.message.success).toBe(false);
    });
  });
});
