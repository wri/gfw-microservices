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

// Mocks for data-layer managers
jest.mock('../../../config/publicutils/proManager.utils', () => ({
  updatePendingAccountUser: jest.fn().mockResolvedValue(undefined),
  updateGlobalAnalysisLimits: jest.fn().mockResolvedValue('global-ok'),
  updateAccountAnalysisLimits: jest.fn().mockResolvedValue('account-ok'),
  updateOrgName: jest.fn().mockResolvedValue('org-ok'),
  checkOrgName: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../config/publicutils/policyManager.utils', () => ({
  downloadPolicy: jest.fn(),
}));

jest.mock('../../../config/publicutils/userManager.utils', () => ({
  getUserSecret: jest.fn(),
}));

jest.mock('../../../config/publicutils/gfwListManager.utils', () => ({
  updateGFWLists: jest.fn(),
}));

// Middlewares and rate limiter
jest.mock('../../../config/publicutils/middlewares', () => ({
  checkProManagerAuthentication: (_req: unknown, _res: unknown, next: () => void) => next(),
  rateLimitAuthenticated: {},
}));

jest.mock('../../../config/lib/limiter-util', () => ({
  useRateLimiter: jest.fn(() => false),
}));

// Mock controller so we don't exercise controller logic here
jest.mock('../controllers/proManagerList.controller', () => ({
  proManagerList: jest.fn((req, res) => res.status(200).send('list')),
  proManagerListAccountsData: jest.fn((req, res) => res.status(200).json({ route: 'accounts' })),
  proManagerListAccountDetailData: jest.fn((req, res) =>
    res.status(200).json({ route: 'account-detail' })
  ),
  proManagerListUsersData: jest.fn((req, res) => res.status(200).json({ route: 'users' })),
  proManagerListUserDetailData: jest.fn((req, res) =>
    res.status(200).json({ route: 'user-detail' })
  ),
  activatePendingAccount: jest.fn((req, res) => res.status(200).json({ route: 'activate' })),
  reactivateAccount: jest.fn((req, res) => res.status(200).json({ route: 'reactivate' })),
  deactivateAccount: jest.fn((req, res) => res.status(200).json({ route: 'deactivate' })),
  closePendingAccount: jest.fn((req, res) => res.status(200).json({ route: 'close-pending' })),
  updateProAccount: jest.fn((req, res) => res.status(200).json({ route: 'update-pro-account' })),
}));

const logger = require('../../../config/privateutils/logger.utils');
const ProManager = require('../../../config/publicutils/proManager.utils');
const PolicyManager = require('../../../config/publicutils/policyManager.utils');
const UserManager = require('../../../config/publicutils/userManager.utils');
const GFWListManager = require('../../../config/publicutils/gfwListManager.utils');
const controller = require('../controllers/proManagerList.controller');

const registerRoutes = require('./proManagerList.routes');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  registerRoutes(app, jest.fn());
  return app;
};

describe('proManagerList.routes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  it('GET /pro-manager-list calls controller.proManagerList', async () => {
    const res = await request(app).get('/pro-manager-list');
    expect(controller.proManagerList).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.text).toBe('list');
  });

  it('GET /pro-manager-list/accounts/ calls controller.proManagerListAccountsData', async () => {
    const res = await request(app).get('/pro-manager-list/accounts/');
    expect(controller.proManagerListAccountsData).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'accounts' });
  });

  it('GET /pro-manager-list/accounts/:id/:name calls account-detail controller', async () => {
    const res = await request(app).get('/pro-manager-list/accounts/1/foo');
    expect(controller.proManagerListAccountDetailData).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'account-detail' });
  });

  it('GET /pro-manager-list/users calls users controller', async () => {
    const res = await request(app).get('/pro-manager-list/users');
    expect(controller.proManagerListUsersData).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'users' });
  });

  it('GET /pro-manager-list/users/:orgId/:userId calls user-detail controller', async () => {
    const res = await request(app).get('/pro-manager-list/users/2/10');
    expect(controller.proManagerListUserDetailData).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'user-detail' });
  });

  it('POST /pro-manager/activatePendingAccount calls controller.activatePendingAccount', async () => {
    const res = await request(app).post('/pro-manager/activatePendingAccount').send({ id: 1 });
    expect(controller.activatePendingAccount).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'activate' });
  });

  it('POST /pro-manager/reactivateAccount calls controller.reactivateAccount', async () => {
    const res = await request(app).post('/pro-manager/reactivateAccount').send({ id: 1 });
    expect(controller.reactivateAccount).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'reactivate' });
  });

  it('POST /pro-manager/deactivateAccount calls controller.deactivateAccount', async () => {
    const res = await request(app).post('/pro-manager/deactivateAccount').send({ id: 1 });
    expect(controller.deactivateAccount).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'deactivate' });
  });

  it('POST /pro-manager/closePendingAccount calls controller.closePendingAccount', async () => {
    const res = await request(app).post('/pro-manager/closePendingAccount').send({ id: 1 });
    expect(controller.closePendingAccount).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'close-pending' });
  });

  it('POST /pro-manager/updateProAccount calls controller.updateProAccount', async () => {
    const res = await request(app).post('/pro-manager/updateProAccount').send({ id: 1 });
    expect(controller.updateProAccount).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: 'update-pro-account' });
  });

  it('POST /pro-manager/updateProAccountUser succeeds and redirects', async () => {
    ProManager.updatePendingAccountUser.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/pro-manager/updateProAccountUser')
      .send({ id: 1, first_name: 'A' });

    expect(ProManager.updatePendingAccountUser).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ redirect: '/pro-manager-list' });
  });

  it('POST /pro-manager/updateProAccountUser forwards error on failure', async () => {
    const error = { message: 'fail' };
    ProManager.updatePendingAccountUser.mockRejectedValue(error);

    const res = await request(app)
      .post('/pro-manager/updateProAccountUser')
      .send({ id: 1, first_name: 'A' });

    expect(logger.info).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual(error);
  });

  it('GET /pro-manager/downloadPolicyPro/:policyList/:orgID streams file', async () => {
    const { PassThrough } = require('stream');
    const mockStream = new PassThrough();
    mockStream.write('file content');
    mockStream.end();

    PolicyManager.downloadPolicy.mockResolvedValue(mockStream);

    const res = await request(app).get('/pro-manager/downloadPolicyPro/test.pdf/10');

    expect(PolicyManager.downloadPolicy).toHaveBeenCalledWith(
      expect.anything(),
      ['test.pdf'],
      ['10']
    );
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('test.pdf');
  });

  it('POST /userSecret returns secret', async () => {
    UserManager.getUserSecret.mockResolvedValue('secret-value');

    const res = await request(app).post('/userSecret').send({ email: 'a@b.com' });

    expect(UserManager.getUserSecret).toHaveBeenCalledWith(expect.anything(), 'a@b.com');
    expect(res.status).toBe(200);
    expect(res.text).toBe('secret-value');
  });

  it('POST /pro-manager/gfwlists succeeds', async () => {
    GFWListManager.updateGFWLists.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/pro-manager/gfwlists')
      .send({ list_ids: [1, 2] });

    expect(GFWListManager.updateGFWLists).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.text).toBe('success');
  });

  it('POST /pro-manager/gfwlists forwards error on failure', async () => {
    const error = { message: 'fail' };
    GFWListManager.updateGFWLists.mockRejectedValue(error);

    const res = await request(app)
      .post('/pro-manager/gfwlists')
      .send({ list_ids: [1, 2] });

    expect(logger.info).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual(error);
  });

  it('POST /pro-manager/updateGlobalAnalysisLimits returns success on happy path', async () => {
    ProManager.updateGlobalAnalysisLimits.mockResolvedValue({ ok: true });

    const res = await request(app)
      .post('/pro-manager/updateGlobalAnalysisLimits')
      .send({ subscriptionStatusId: 1, MaxAreaPerList: 10, MaxAreaAnalyzeablePerYear: 20 });

    expect(ProManager.updateGlobalAnalysisLimits).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'success', data: { ok: true } });
  });

  it('POST /pro-manager/updateGlobalAnalysisLimits returns 500 on error', async () => {
    ProManager.updateGlobalAnalysisLimits.mockRejectedValue(new Error('fail'));

    const res = await request(app)
      .post('/pro-manager/updateGlobalAnalysisLimits')
      .send({ subscriptionStatusId: 1 });

    expect(logger.info).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });

  it('POST /pro-manager/updateAccountAnalysisLimits returns success', async () => {
    ProManager.updateAccountAnalysisLimits.mockResolvedValue({ ok: true });

    const res = await request(app)
      .post('/pro-manager/updateAccountAnalysisLimits')
      .send({ organizationId: 1 });

    expect(ProManager.updateAccountAnalysisLimits).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'success', data: { ok: true } });
  });

  it('POST /pro-manager/updateAccountAnalysisLimits returns 500 on error', async () => {
    ProManager.updateAccountAnalysisLimits.mockRejectedValue(new Error('fail'));

    const res = await request(app)
      .post('/pro-manager/updateAccountAnalysisLimits')
      .send({ organizationId: 1 });

    expect(logger.info).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });

  it('POST /pro-manager/updateOrgName returns success', async () => {
    ProManager.updateOrgName.mockResolvedValue({ ok: true });

    const res = await request(app).post('/pro-manager/updateOrgName').send({ id: 1, name: 'Org' });

    expect(ProManager.updateOrgName).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'success', data: { ok: true } });
  });

  it('POST /pro-manager/updateOrgName returns 500 on error', async () => {
    ProManager.updateOrgName.mockRejectedValue(new Error('fail'));

    const res = await request(app).post('/pro-manager/updateOrgName').send({ id: 1, name: 'Org' });

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });

  it('POST /pro-manager/checkOrgName returns exists flag', async () => {
    ProManager.checkOrgName.mockResolvedValue(true);

    const res = await request(app).post('/pro-manager/checkOrgName').send({ name: 'Org' });

    expect(ProManager.checkOrgName).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ exists: true });
  });

  it('POST /pro-manager/checkOrgName returns 500 on error', async () => {
    ProManager.checkOrgName.mockRejectedValue(new Error('fail'));

    const res = await request(app).post('/pro-manager/checkOrgName').send({ name: 'Org' });

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });
});
