import type { NextFunction, Request, RequestHandler, Response } from 'express';
import {
  createSplashPageMiddleware,
  DEFAULT_SPLASH_PAGE_DATE,
  SPLASH_PAGE_ROUTES,
} from './splashPage';

const createReq = (overrides: Partial<Request> = {}): Request =>
  ({
    method: 'GET',
    path: '/',
    ...overrides,
  } as unknown as Request);

const createRes = (): Response =>
  ({ status: jest.fn().mockReturnThis(), render: jest.fn() } as unknown as Response);

const createNext = (): NextFunction => jest.fn();

const renderSplash = jest.fn();

const run = (middleware: RequestHandler, req: Request) => {
  const res = createRes();
  const next = createNext();
  middleware(req, res, next);
  return { res, next };
};

describe('createSplashPageMiddleware', () => {
  beforeEach(() => {
    renderSplash.mockClear();
  });

  describe('before the activation date', () => {
    it('calls next() for page routes', () => {
      const middleware = createSplashPageMiddleware({ date: '2099-01-01T00:00:00Z', renderSplash });
      const { next } = run(middleware, createReq());
      expect(next).toHaveBeenCalledTimes(1);
      expect(renderSplash).not.toHaveBeenCalled();
    });
  });

  describe('after the activation date', () => {
    const ACTIVE = { date: '2020-01-01T00:00:00Z', renderSplash };

    it('renders the splash page for page routes', () => {
      const middleware = createSplashPageMiddleware(ACTIVE);
      const { res, next } = run(middleware, createReq());
      expect(next).not.toHaveBeenCalled();
      expect(renderSplash).toHaveBeenCalledTimes(1);
      expect(renderSplash).toHaveBeenCalledWith(res);
    });

    it('renders the splash page for page routes with a trailing slash', () => {
      const middleware = createSplashPageMiddleware(ACTIVE);
      const { next } = run(middleware, createReq({ path: '/user-profile/' }));
      expect(next).not.toHaveBeenCalled();
      expect(renderSplash).toHaveBeenCalledTimes(1);
    });

    it('renders the splash page for every configured page route', () => {
      const middleware = createSplashPageMiddleware(ACTIVE);
      for (const route of SPLASH_PAGE_ROUTES) {
        renderSplash.mockClear();
        const { next } = run(middleware, createReq({ path: route }));
        expect(next).not.toHaveBeenCalled();
        expect(renderSplash).toHaveBeenCalledTimes(1);
      }
    });

    it('passes through non-GET requests even on page routes', () => {
      const middleware = createSplashPageMiddleware(ACTIVE);
      const { next } = run(middleware, createReq({ method: 'POST' }));
      expect(next).toHaveBeenCalledTimes(1);
      expect(renderSplash).not.toHaveBeenCalled();
    });

    it('passes through API routes', () => {
      const middleware = createSplashPageMiddleware(ACTIVE);
      for (const path of ['/api/health-check', '/api/locations']) {
        const { next } = run(middleware, createReq({ path }));
        expect(next).toHaveBeenCalledTimes(1);
        expect(renderSplash).not.toHaveBeenCalled();
      }
    });

    it('passes through authentication and data endpoints', () => {
      const middleware = createSplashPageMiddleware(ACTIVE);
      const paths = [
        '/auth/signout',
        '/folder',
        '/publicKey/1',
        '/vc-issuer/1',
        '/arcgis/rest/services/services/VectorTileServer/',
        '/getUserLists',
        '/user-profile-data/123',
        '/user-profile-data/new',
        '/profile/info',
        '/profile/downloadPolicy/some-policy',
        '/pro-manager/downloadPolicyPro/list/org',
        '/map/getPlanetTilesInfo',
        '/map/getPlanetTile/1',
        '/vectorTile/1',
        '/listData',
        '/converter/all',
        '/geojson-defreport.jsonld',
        '/locations/area/123',
        '/locations/csv/123',
        '/locations/shapefile/123',
        '/locations/geojson/123',
        '/locations/downloadShape',
        '/locations/downloadErrorFile',
        '/locations/filters/123',
        '/locations/getListsPaginated',
      ];
      for (const path of paths) {
        renderSplash.mockClear();
        const { next } = run(middleware, createReq({ path }));
        expect(next).toHaveBeenCalledTimes(1);
        expect(renderSplash).not.toHaveBeenCalled();
      }
    });

    it('passes through static asset requests (file extensions)', () => {
      const middleware = createSplashPageMiddleware(ACTIVE);
      for (const path of ['/gnw-logo.png', '/bundle.js', '/fonts/fira.woff2', '/styles.css']) {
        const { next } = run(middleware, createReq({ path }));
        expect(next).toHaveBeenCalledTimes(1);
        expect(renderSplash).not.toHaveBeenCalled();
      }
    });

    it('passes through unknown routes so they fall to the 404 handler', () => {
      const middleware = createSplashPageMiddleware(ACTIVE);
      const { next } = run(middleware, createReq({ path: '/not-a-real-page' }));
      expect(next).toHaveBeenCalledTimes(1);
      expect(renderSplash).not.toHaveBeenCalled();
    });
  });

  describe('custom page routes', () => {
    it('uses the provided page route list', () => {
      const middleware = createSplashPageMiddleware({
        date: '2020-01-01T00:00:00Z',
        pageRoutes: ['/custom'],
        renderSplash,
      });
      const shown = run(middleware, createReq({ path: '/custom/' }));
      expect(shown.next).not.toHaveBeenCalled();
      expect(renderSplash).toHaveBeenCalledTimes(1);

      renderSplash.mockClear();
      const skipped = run(middleware, createReq({ path: '/locations' }));
      expect(skipped.next).toHaveBeenCalledTimes(1);
      expect(renderSplash).not.toHaveBeenCalled();
    });
  });

  describe('SPLASH_PAGE_ENABLED=false', () => {
    it('never renders the splash page even after the activation date', () => {
      const middleware = createSplashPageMiddleware({
        date: '2020-01-01T00:00:00Z',
        enabled: 'false',
        renderSplash,
      });
      const { next } = run(middleware, createReq());
      expect(next).toHaveBeenCalledTimes(1);
      expect(renderSplash).not.toHaveBeenCalled();
    });
  });

  describe('defaults', () => {
    it('uses the retirement date by default (inactive today)', () => {
      expect(DEFAULT_SPLASH_PAGE_DATE).toBe('2026-12-31T23:59:59Z');
      const middleware = createSplashPageMiddleware({ renderSplash });
      const { next } = run(middleware, createReq());
      expect(next).toHaveBeenCalledTimes(1);
      expect(renderSplash).not.toHaveBeenCalled();
    });
  });
});
