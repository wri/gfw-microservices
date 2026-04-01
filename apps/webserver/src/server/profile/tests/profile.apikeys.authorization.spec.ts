/**
 * @jest-environment node
 */

import request from 'supertest';
import express from 'express';

const mockCheckAdministrator = jest.fn((req: any, res: any, next: () => void) => {
  if (req.session.user_access_level_id !== 1) {
    return res
      .status(403)
      .json({ error: 'Forbidden: Administrator access required', redirect: '/' });
  }
  next();
});

jest.mock('../../../config/publicutils/middlewares', () => ({
  __esModule: true,
  default: {
    checkAuthentication: (_req, _res, next) => next(),
    checkOrganization: (_req, _res, next) => next(),
    checkActive: (_req, _res, next) => next(),
    checkInactivity: (_req, _res, next) => next(),
    checkAdministrator: mockCheckAdministrator,
    rateLimitAuthenticated: {},
  },
}));

jest.mock('../../../config/lib/limiter-util', () => ({
  __esModule: true,
  default: { useRateLimiter: () => false },
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  logActivity: jest.fn().mockResolvedValue(true),
  listActivityTypes: { User: { UserUpdated: 'UserUpdated' } },
}));

jest.mock('../../../config/publicutils/userManager.utils', () => ({
  isAdministrator: jest.fn(),
}));

jest.mock('../../../config/publicutils/accountManager.utils', () => ({}));

jest.mock('../../../config/publicutils/policyManager.utils', () => ({}));

jest.mock('../../../config/publicutils/authenticationManager.utils', () => ({}));

jest.mock('../../../config/privateutils/slackNotifications.utils', () => ({
  default: {
    buildSlackNotificationMessage: jest.fn(),
    sendNotification: jest.fn(),
  },
}));

jest.mock('../../../config/publicutils/validation.middleware', () => ({
  validateRequest: () => (_req, _res, next) => next(),
  updateUserSchema: {},
}));

jest.mock('axios', () => ({
  default: jest.fn().mockResolvedValue({ data: [] }),
}));

jest.mock('../controllers/profile.controller', () => ({
  profile: jest.fn((_req, res) => res.status(200).send()),
  profileInfo: jest.fn((_req, res) => res.status(200).send()),
}));

const createApp = (sessionOverrides: Record<string, any> = {}) => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).session = {
      organization_id: 1,
      organization_database: 'test_db',
      organization_user_id: 1,
      user_access_level_id: 1,
      ...sessionOverrides,
    };
    next();
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const registerRoutes = require('../routes/profile.routes.ts');
  const routeRegistration = registerRoutes.default || registerRoutes;
  routeRegistration(app, () => () => (_req, _res, next) => next());
  return app;
};

describe('GET /api/profile/api-keys - Authorization Controls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EAPI_MICROSERVICE_URL = 'https://eapi.example.com';
  });

  it('should invoke checkAdministrator middleware for api-keys route', async () => {
    const app = createApp({ user_access_level_id: 1 });
    await request(app).get('/api/profile/api-keys');
    expect(mockCheckAdministrator).toHaveBeenCalled();
  });

  it('should return 403 for non-admin users (Editor) on GET /api/profile/api-keys', async () => {
    const app = createApp({ user_access_level_id: 2 });
    const res = await request(app).get('/api/profile/api-keys');
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      error: 'Forbidden: Administrator access required',
      redirect: '/',
    });
  });

  it('should return 403 for non-admin users (Viewer) on GET /api/profile/api-keys', async () => {
    const app = createApp({ user_access_level_id: 3 });
    const res = await request(app).get('/api/profile/api-keys');
    expect(res.status).toBe(403);
  });

  it('should return 403 for non-admin users on POST /api/profile/api-keys', async () => {
    const app = createApp({ user_access_level_id: 2 });
    const res = await request(app).post('/api/profile/api-keys');
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      error: 'Forbidden: Administrator access required',
      redirect: '/',
    });
  });

  it('should return 403 for non-admin users on DELETE /api/profile/api-keys/:tokenId', async () => {
    const app = createApp({ user_access_level_id: 3 });
    const res = await request(app).delete('/api/profile/api-keys/some-token-id');
    expect(res.status).toBe(403);
  });
});
