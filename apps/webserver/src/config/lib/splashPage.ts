import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Splash page configuration.
 * After this date, all page routes serve the retirement splash page
 * (React view rendered via splashLayout.pug) instead of the normal application.
 *
 * SPLASH_PAGE_ENABLED=false disables the splash page entirely.
 * SPLASH_PAGE_DATE overrides the activation date (ISO string), e.g. for
 * local preview: SPLASH_PAGE_DATE=2020-01-01
 */
export const DEFAULT_SPLASH_PAGE_DATE = '2026-12-31T23:59:59Z';

export interface SplashPageOptions {
  /** ISO date string after which the splash page becomes active. */
  date?: string;
  /** Set to 'false' to disable the splash page entirely. */
  enabled?: string;
  /** Renders the splash view. Injected so the middleware stays testable. */
  renderSplash: (res: Response) => void;
}

/**
 * @function createSplashPageMiddleware
 * @summary Builds the splash page middleware. After the configured date, all
 *          page routes serve the retirement splash page instead of the normal
 *          application. API routes, non-GET requests and static asset requests
 *          are skipped so health checks, programmatic clients and bundled
 *          assets keep working.
 */
export const createSplashPageMiddleware = ({
  date = DEFAULT_SPLASH_PAGE_DATE,
  enabled,
  renderSplash,
}: SplashPageOptions): RequestHandler => {
  const splashDate = new Date(date).getTime();
  const isEnabled = enabled !== 'false';
  const isSplashPageActive = () => isEnabled && Date.now() >= splashDate;

  return (req: Request, res: Response, next: NextFunction) => {
    if (!isSplashPageActive()) {
      return next();
    }
    if (req.method !== 'GET' || req.path.startsWith('/api/')) {
      return next();
    }
    // Let requests for bundled static assets (images, fonts, etc.) fall through
    // to the static asset middleware instead of rendering the splash page.
    if (/\.[a-zA-Z0-9]+$/.test(req.path) && !req.path.endsWith('.html')) {
      return next();
    }
    return renderSplash(res);
  };
};
