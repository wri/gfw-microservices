/**
 * @jest-environment node
 */

const express = require('express');
const request = require('supertest');

jest.mock('../../../config/publicutils/middlewares', () => ({
  checkAuthentication: (req, res, next) => next(),
  checkOrganization: (req, res, next) => next(),
  checkActive: (req, res, next) => next(),
  checkInactivity: (req, res, next) => next(),
  rateLimitAuthenticated: {},
}));

jest.mock('../../../config/lib/limiter-util', () => ({
  useRateLimiter: () => false,
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../controllers/map.controller', () => ({
  map: (req, res) => res.send('ok'),
}));

jest.mock('../../../config/publicutils/listManager.utils', () => ({
  getListLocations: jest.fn(),
}));

jest.mock('axios');

const axios = require('axios');
const logger = require('../../../config/privateutils/logger.utils');
const ListManager = require('../../../config/publicutils/listManager.utils');
const mapRoutes = require('../routes/map.routes');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  mapRoutes(app, null);
  return app;
};

describe('map.routes error handling', () => {
  let app;
  let fetchSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
    // Keep handlers that use fetch away from real network
    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      statusText: 'unavailable',
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('/map/getPlanetTilesInfo', () => {
    it('returns 502 on upstream failure without a response status', async () => {
      axios.get.mockRejectedValueOnce(new Error('network down'));

      const res = await request(app).get('/map/getPlanetTilesInfo');

      expect(res.status).toBe(502);
      expect(res.body).toEqual({ message: '/map/getPlanetTilesInfo failed' });
      expect(logger.error).toHaveBeenCalledWith('getPlanetTilesInfo Error', expect.any(Object));
    });

    it('forwards upstream error response status when present', async () => {
      axios.get.mockRejectedValueOnce({
        response: { status: 503, data: 'upstream busy' },
        stack: 'err',
      });

      const res = await request(app).get('/map/getPlanetTilesInfo');

      expect(res.status).toBe(503);
    });

    it('returns 200 with upstream data on success', async () => {
      axios.get.mockResolvedValueOnce({
        headers: { 'cache-control': 'no-cache', 'content-type': 'application/json' },
        data: { mosaics: [] },
      });

      const res = await request(app).get('/map/getPlanetTilesInfo');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ mosaics: [] });
    });
  });

  describe('/map/getPlanetTile/*', () => {
    it('returns 502 on upstream failure without a response status', async () => {
      axios.get.mockRejectedValueOnce(new Error('network down'));

      const res = await request(app).get('/map/getPlanetTile/abc/1/2/3');

      expect(res.status).toBe(502);
      expect(res.body).toEqual({ message: '/map/getPlanetTile failed' });
      expect(logger.error).toHaveBeenCalledWith('POST /map/getPlanetTile/', expect.any(Object));
    });

    it('forwards upstream error response status when present', async () => {
      axios.get.mockRejectedValueOnce({
        response: { status: 404, data: 'not found' },
      });

      const res = await request(app).get('/map/getPlanetTile/abc/1/2/3');

      expect(res.status).toBe(404);
    });
  });

  describe('/map/getUserListLocationData-map', () => {
    it('returns 500 when ListManager.getListLocations rejects', async () => {
      ListManager.getListLocations.mockRejectedValueOnce(
        Object.assign(new Error('db error'), { errorCode: 'E_DB' })
      );

      const res = await request(app)
        .post('/map/getUserListLocationData-map')
        .send({ list_ids: '1' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ errorCode: 'E_DB', message: 'Getting list data failed!' });
      expect(logger.error).toHaveBeenCalledWith(
        'POST /map/getUserListLocationData-map',
        expect.any(String)
      );
    });
  });

  describe('GFW data-api error logging', () => {
    it('logs via logger.error (not console.error) and returns 500 on data-api failure', async () => {
      const res = await request(app)
        .get('/map/gfw_universal_mill_list')
        .query({ searchInput: 'mill' });

      expect(res.status).toBe(500);
      expect(logger.error).toHaveBeenCalledWith('GFW data-api query failed', expect.any(String));
    });
  });
});
