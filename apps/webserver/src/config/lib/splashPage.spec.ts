import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { createSplashPageMiddleware, DEFAULT_SPLASH_PAGE_DATE } from './splashPage';

const createReq = (overrides: Partial<Request> = {}): Request =>
  ({
    method: 'GET',
    path: '/',
    ...overrides,
  }) as unknown as Request;

const createRes = (): Response => ({ status: jest.fn().mockReturnThis(), render: jest.fn() }) as unknown as Response;

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
    it('renders the splash page for page routes', () => {
      const middleware = createSplashPageMiddleware({ date: '2020-01-01T00:00:00Z', renderSplash });
      const { res, next } = run(middleware, createReq());
      expect(next).not.toHaveBeenCalled();
      expect(renderSplash).toHaveBeenCalledTimes(1);
      expect(renderSplash).toHaveBeenCalledWith(res);
    });

    it('passes through non-GET requests', () => {
      const middleware = createSplashPageMiddleware({ date: '2020-01-01T00:00:00Z', renderSplash });
      const { next } = run(middleware, createReq({ method: 'POST' }));
      expect(next).toHaveBeenCalledTimes(1);
      expect(renderSplash).not.toHaveBeenCalled();
    });

    it('passes through /api/ routes', () => {
      const middleware = createSplashPageMiddleware({ date: '2020-01-01T00:00:00Z', renderSplash });
      const { next } = run(middleware, createReq({ path: '/api/health-check' }));
      expect(next).toHaveBeenCalledTimes(1);
      expect(renderSplash).not.toHaveBeenCalled();
    });

    it('passes through static asset requests (file extensions)', () => {
      const middleware = createSplashPageMiddleware({ date: '2020-01-01T00:00:00Z', renderSplash });
      for (const path of ['/gnw-logo.png', '/bundle.js', '/fonts/fira.woff2', '/styles.css']) {
        const { next } = run(middleware, createReq({ path }));
        expect(next).toHaveBeenCalledTimes(1);
        expect(renderSplash).not.toHaveBeenCalled();
      }
    });

    it('renders the splash page for .html routes', () => {
      const middleware = createSplashPageMiddleware({ date: '2020-01-01T00:00:00Z', renderSplash });
      const { next } = run(middleware, createReq({ path: '/some-page.html' }));
      expect(next).not.toHaveBeenCalled();
      expect(renderSplash).toHaveBeenCalledTimes(1);
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
