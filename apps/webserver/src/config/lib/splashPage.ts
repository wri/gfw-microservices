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

/**
 * Page routes that serve the splash page once it is active. Exact matches
 * only (trailing slashes are ignored): anything else — API/data endpoints,
 * downloads, signout, tile servers, etc. — keeps working normally.
 */
export const SPLASH_PAGE_ROUTES = [
  '/',
  '/about',
  '/account',
  '/activity-log',
  '/analytics',
  '/apimap',
  '/change',
  '/changeExist',
  '/diagnostics',
  '/forgot',
  '/list-details',
  '/locations',
  '/map',
  '/more',
  '/profile',
  '/pro-manager',
  '/reset',
  '/select',
  '/user-profile',
  '/verify',
];

export interface SplashPageOptions {
  /** ISO date string after which the splash page becomes active. */
  date?: string;
  /** Set to 'false' to disable the splash page entirely. */
  enabled?: string;
  /** Page routes that get the splash page. Defaults to SPLASH_PAGE_ROUTES. */
  pageRoutes?: string[];
  /** Renders the splash view. Injected so the middleware stays testable. */
  renderSplash: (res: Response) => void;
}

/**
 * @function createSplashPageMiddleware
 * @summary Builds the splash page middleware. After the configured date, page
 *          routes (see SPLASH_PAGE_ROUTES) serve the retirement splash page
 *          instead of the normal application. Everything else — API routes,
 *          non-GET requests, static assets and data endpoints — is skipped.
 */
export const createSplashPageMiddleware = ({
  date = DEFAULT_SPLASH_PAGE_DATE,
  enabled,
  pageRoutes = SPLASH_PAGE_ROUTES,
  renderSplash,
}: SplashPageOptions): RequestHandler => {
  const splashDate = new Date(date).getTime();
  const isEnabled = enabled !== 'false';
  const isSplashPageActive = () => isEnabled && Date.now() >= splashDate;
  const splashPaths = new Set(pageRoutes.map((route) => route.replace(/\/+$/, '') || '/'));
  const isPageRoute = (path: string) => splashPaths.has(path.replace(/\/+$/, '') || '/');

  return (req: Request, res: Response, next: NextFunction) => {
    if (!isSplashPageActive()) {
      return next();
    }
    if (req.method !== 'GET' || !isPageRoute(req.path)) {
      return next();
    }
    return renderSplash(res);
  };
};
