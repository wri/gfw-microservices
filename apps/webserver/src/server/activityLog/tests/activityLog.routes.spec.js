/**
 * @jest-environment node
 */

// The route file uses path.resolve('./config/...') which resolves from CWD.
// We mock path.resolve to redirect those to the actual module locations under src/.
jest.mock('path', () => {
  const actual = jest.requireActual('path');
  const mockSrcRoot = actual.resolve(__dirname, '..', '..', '..');
  return {
    ...actual,
    resolve: (p) => {
      if (typeof p === 'string' && p.startsWith('./config/')) {
        return actual.resolve(mockSrcRoot, p.replace('./', ''));
      }
      return actual.resolve(p);
    },
  };
});

const mockCheckAdministrator = jest.fn((req, res, next) => {
  if (req.session.user_access_level_id !== 1) {
    return res
      .status(403)
      .json({ error: 'Forbidden: Administrator access required', redirect: '/' });
  }
  next();
});

jest.mock('../../../config/publicutils/middlewares', () => ({
  checkAuthentication: (req, res, next) => next(),
  checkOrganization: (req, res, next) => next(),
  checkActive: (req, res, next) => next(),
  checkInactivity: (req, res, next) => next(),
  checkAdministrator: mockCheckAdministrator,
  rateLimitAuthenticated: {},
}));

jest.mock('../../../config/lib/limiter-util', () => ({
  useRateLimiter: () => false,
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  getActivityLog: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../../config/config', () => ({
  default: {
    compiledAssets: {
      js: { common: 'common.js', activityLog: 'activityLog.js' },
      css: { activityLog: 'activityLog.css' },
    },
    platformVars: {
      accessLevel: { Administrator: 1, Editor: 2, Viewer: 3 },
    },
  },
}));

const express = require('express');
const request = require('supertest');
const registerRoutes = require('../routes/activityLog.routes');

const buildApp = (sessionOverrides = {}) => {
  const app = express();
  app.use(express.json());
  app.set('view engine', 'pug');
  app.engine('pug', (_path, _options, callback) => {
    callback(null, '<html></html>');
  });
  app.use((req, _res, next) => {
    req.session = {
      organization_id: 1,
      organization_database: 'test_db',
      user_access_level_id: 1,
      ...sessionOverrides,
    };
    next();
  });
  registerRoutes(app, () => () => (_req, _res, next) => next());
  return app;
};

describe('activityLog.routes - admin access control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /activity-log', () => {
    it('should allow access for admin users', async () => {
      const app = buildApp({ user_access_level_id: 1 });
      const res = await request(app).get('/activity-log');
      // The route reaches the handler (render may fail in test env, but it's not a 403)
      expect(res.status).not.toBe(403);
      expect(mockCheckAdministrator).toHaveBeenCalled();
    });

    it('should return 403 for non-admin users (Editor)', async () => {
      const app = buildApp({ user_access_level_id: 2 });
      const res = await request(app).get('/activity-log');
      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        error: 'Forbidden: Administrator access required',
        redirect: '/',
      });
    });

    it('should return 403 for non-admin users (Viewer)', async () => {
      const app = buildApp({ user_access_level_id: 3 });
      const res = await request(app).get('/activity-log');
      expect(res.status).toBe(403);
    });
  });

  describe('POST /activityLog', () => {
    it('should allow access for admin users', async () => {
      const ActivityLogger = require('../../../config/privateutils/logger.utils');
      ActivityLogger.getActivityLog.mockResolvedValue([{ id: 1 }]);

      const app = buildApp({ user_access_level_id: 1 });
      const res = await request(app).post('/activityLog');
      expect(res.status).toBe(200);
      expect(mockCheckAdministrator).toHaveBeenCalled();
    });

    it('should return 403 for non-admin users', async () => {
      const app = buildApp({ user_access_level_id: 2 });
      const res = await request(app).post('/activityLog');
      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        error: 'Forbidden: Administrator access required',
        redirect: '/',
      });
    });
  });
});
