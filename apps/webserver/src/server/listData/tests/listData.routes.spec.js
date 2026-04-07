/**
 * @jest-environment node
 */

const express = require('express');
const request = require('supertest');

// Mock middlewares to simple pass-through
jest.mock('../../../config/publicutils/middlewares', () => ({
  checkAuthentication: (req, res, next) => next(),
  checkOrganization: (req, res, next) => next(),
  checkActive: (req, res, next) => next(),
  checkInactivity: (req, res, next) => next(),
  rateLimitAuthenticated: {},
}));

// Disable rate limiter during tests
jest.mock('../../../config/lib/limiter-util', () => ({
  useRateLimiter: () => false,
}));

// Mock logger to avoid external transports
jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock data managers used by the controller
jest.mock('../../../config/publicutils/listManager.utils', () => ({
  getListLocationsNoGeom: jest.fn(),
  getPaginatedAnalysisDataForUserList: jest.fn(),
}));

jest.mock('../../../config/publicutils/locationManager.utils', () => ({
  getLocationAttributesList: jest.fn(),
}));

jest.mock('../../../config/publicutils/analysisManager.utils', () => ({
  getListAnalyses: jest.fn(),
  getAnalysisDataForUserList: jest.fn(),
}));

jest.mock('../utils/listData.utils', () => ({
  getListDataFiltered: jest.fn((data) => data),
}));

jest.mock('../../../config/privateutils/list.utils', () => ({
  getListNameSchema: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@wri-monorepos/constants', () => ({
  analysisTypes: { Loss: 'Loss', Density: 'Density' },
  listStatus: { Draft: 'Draft', Pending: 'Pending' },
  AlertsAnalysisFrequency: { WEEKLY: 'Weekly' },
}));

jest.mock('@wri-monorepos/geo', () => ({
  getListAnalysisStatusByListId: jest.fn(),
  setSelectedAnalyses: jest.fn(),
}));

jest.mock('@wri-monorepos/shared', () => ({
  featureFlagsService: jest.fn().mockResolvedValue({
    getClientIdByClientStoreDatabaseName: jest.fn().mockResolvedValue(1),
    getFeatureFlagsForCurrentOrg: jest
      .fn()
      .mockResolvedValue([{ flagId: 'WeeklyAlerts', flagState: true }]),
  }),
  retryWithDelay: (fn) => fn(),
  isRetryableError: jest.fn().mockReturnValue(false),
}));

const axios = require('axios');
jest.mock('axios');

const ListManager = require('../../../config/publicutils/listManager.utils');
const LocationManager = require('../../../config/publicutils/locationManager.utils');
const AnalysisManager = require('../../../config/publicutils/analysisManager.utils');
const { getListDataFiltered } = require('../utils/listData.utils');
const { getListAnalysisStatusByListId, setSelectedAnalyses } = require('@wri-monorepos/geo');

const registerRoutes = require('../routes/listData.routes');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.session = { organization_database: 'org', organization_id: 'id' };
    next();
  });
  registerRoutes(app, () => () => (_req, _res, next) => next());
  return app;
};

describe('listData.routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LISTS_MICROSERVICE_URL = 'https://lists.example.com';
    app = buildApp();
  });

  it('GET /listData returns filtered list data', async () => {
    AnalysisManager.getListAnalyses.mockResolvedValue([{ id: 1 }]);
    ListManager.getListLocationsNoGeom.mockResolvedValue([{ location_id: 1 }]);
    LocationManager.getLocationAttributesList.mockResolvedValue([{ location_id: 1 }]);
    AnalysisManager.getAnalysisDataForUserList.mockResolvedValue([{ analysis: true }]);
    getListDataFiltered.mockReturnValue({ ok: true });

    const res = await request(app).get('/listData').query({ list_id: 'abc' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('POST /listDataCustom returns mapped columns', async () => {
    ListManager.getPaginatedAnalysisDataForUserList.mockResolvedValue([
      { list_id: 'l1', Latitude: 1, Longitude: 2, location_id: 3, foo: 'bar', extra: 9 },
    ]);

    const res = await request(app)
      .post('/listDataCustom')
      .send({
        list_ids: ['l1'],
        columnsToReturn: 'Latitude,Longitude,location_id,foo',
        filters: {},
      });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { list_id: 'l1', Latitude: 1, Longitude: 2, location_id: 3, foo: 'bar' },
    ]);
  });

  it('GET /api/list/:listId/selectedAnalyses returns analyses', async () => {
    getListAnalysisStatusByListId.mockResolvedValue({ items: [1] });
    const res = await request(app).get('/api/list/42/selectedAnalyses');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: [1] });
  });

  it('POST /api/list/:listId/selectedAnalyses validates missing analysisIds', async () => {
    const res = await request(app)
      .post('/api/list/42/selectedAnalyses')
      .send({ saveAsDraft: false });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'analysisIds is required' });
  });

  it('POST /api/list/:listId/selectedAnalyses creates draft', async () => {
    const res = await request(app).post('/api/list/42/selectedAnalyses').send({
      selectedAnalysis: [],
      saveAsDraft: true,
      isAddingAnalysis: false,
      newAnalysesToRun: [],
    });
    expect(setSelectedAnalyses).toHaveBeenCalled();
    expect(res.status).toBe(201);
  });

  it('GET /api/list/:listId/commodity proxies request', async () => {
    axios.get.mockResolvedValue({ data: { ok: true } });
    const res = await request(app).get('/api/list/7/commodity');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /api/list/by-commodity requires commodity query', async () => {
    const res = await request(app).get('/api/list/by-commodity');
    expect(res.status).toBe(400);
  });

  it('GET /api/list/preview posts preview', async () => {
    axios.post.mockResolvedValue({ data: { preview: true } });
    const res = await request(app).get('/api/list/preview').query({ path: '/tmp/file.csv' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ preview: true });
  });
});
