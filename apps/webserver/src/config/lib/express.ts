const webpackUtils = require('../publicutils/webpack.utils');
const methodOverride = require('method-override');
const compression = require('compression');
import type { RedisClientType } from 'redis';
import { createClient } from 'redis';
const session = require('express-session');
import RedisStore from 'connect-redis';
import { randomUUID } from 'crypto';

const favicon = require('serve-favicon');
import * as logger from '../privateutils/logger.utils';
import { errorSanitizationMiddleware } from '../privateutils/error.utils';
import * as express from 'express';
import { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
const path = require('path');
const rateLimiterUtil = require('./limiter-util');
import config from '../config';
const { compiledAssets } = config;
import { PRODUCTION_ENVIRONMENTS } from '../config/environments.config';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createSplashPageMiddleware } from './splashPage';
import * as expressRateLimit from 'express-rate-limit';
import * as redisRateLimit from 'rate-limit-redis';

// skip certain things not useful for jest unit testing
const unitTestMode = process.env.NODE_ENV === 'test';

// Updating redis and connect-redis requires syntax change for creating client
// redisClient is provided to new RedisStore({client:redisClient})
// redis v2.8.0 -> v3.1.2
// connect-redis v3.4.2 -> v6.0.0
let redisClient: RedisClientType;
if (!unitTestMode) {
  const redisHost = process.env.REDIS_HOST || 'redis';
  const redisPort = process.env.REDIS_PORT || 6379;
  const redisOptions: Record<string, any> = {
    url: `redis://${redisHost}:${redisPort}`,
  };
  if (process.env.REDIS_CONNECT_TIMEOUT) {
    redisOptions.socket = {
      connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT),
    };
  }
  redisClient = createClient(redisOptions);
  redisClient.on('error', (info: any) => {
    logger.error('Express redis error', info);
  });
  redisClient.connect().catch((err) => {
    logger.error('Redis client failed to connect', err?.stack || err);
  });
}

// Middleware to log slow HTTP requests
function slowRequestLogger(thresholdMs) {
  return (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > thresholdMs) {
        logger.warn('Slow Request:', {
          method: req.method,
          url: req.originalUrl,
          orgId: req.session?.organization_id,
          duration,
        });
      }
    });

    next();
  };
}

/**
 * @function configureMiddleware
 * @summary Configure express middleware
 * @param { Express.Application } app
 */
const configureMiddleware = (app: Application) => {
  app.set('trust proxy', 1);
  // Enable stack traces
  app.set('showStackError', true);
  // Enable jsonp via res.jsonp
  app.enable('jsonp callback');
  // Use before static routes applied
  app.use(compression({ level: 9 }));
  // Setup favicon
  app.use(favicon('./server/core/pro-fav.png'));
  // Setup body parser
  app.use(express.urlencoded({ limit: '1024mb', extended: true }));
  app.use(express.json({ limit: '1024mb' }));
  // Setup methodOverride so I can use put and delete
  app.use(methodOverride());

  if (!unitTestMode) {
    // If we're in development mode, add some hot middleware
    if (process.env.NODE_ENV === 'development') {
      // We need to initalize the middleware to compile our webpack resources
      const middleware = webpackUtils.middleware();
      app.use(middleware.dev);
      app.use(middleware.hot);
    }
  }
};

/**
 * @function configureLocalVariables
 * @summary Configure local variables
 * @param {Express.Application} app
 */
const configureLocalVariables = (app: Application) => {
  app.locals.title = config.app.title;
  app.locals.author = config.app.author;
  app.locals.keywords = config.app.keywords;
  app.locals.description = config.app.description;
  app.locals.env = process.env.NODE_ENV;
};

/**
 * @function configureViewEngine
 * @summary Configure view engine
 * @param {Express.Application} app
 */
const configureViewEngine = (app: Application) => {
  // Set the engine and the view paths
  app.set('view engine', 'pug');
  app.set('views', config.files.views);
};

/**
 * @function configureSession
 * @summary Configure express session
 * @param {Express.Application} app
 */
const configureSession = (app: Application) => {
  const sessionParams: Record<string, any> = {
    name: 'gfwpro.globalforestwatch.org',
    saveUninitialized: false,
    secret: config.sessionVars.secret,
    cookie:
      PRODUCTION_ENVIRONMENTS.includes(process.env.NODE_ENV) || process.env.NODE_ENV === 'test'
        ? { secure: false }
        : { secure: true },
    unset: 'destroy',
    resave: false,
    genid: function (req: Request) {
      return randomUUID();
    },
  };
  if (!unitTestMode) {
    sessionParams.store = new RedisStore({ client: redisClient });
  }

  app.use(session(sessionParams));
};

/**
 * Content Security Policy (CSP) Configuration
 * Defines allowed sources for various content types to prevent XSS and other attacks.
 * When adding new third-party services, update the relevant directive below.
 */
const CSP_SCRIPT_SOURCES = [
  "'self'",
  'https://www.googletagmanager.com', // Google Tag Manager
  'https://cmp.osano.com', // Osano consent management
  'https://cdn.transifex.com', // Transifex translations
  'https://zendesk.com', // Zendesk apex domain
  'https://*.zendesk.com', // Zendesk subdomains
  'https://static.zdassets.com', // Zendesk support widget
  'https://*.hotjar.com', // Hotjar subdomains
  'https://plausible.io', // Plausible analytics
  'https://snap.licdn.com', // LinkedIn Insights
  'https://www.clarity.ms', // Microsoft Clarity
  'https://scripts.clarity.ms', // Microsoft Clarity scripts
  'https://engage.globalforestwatch.org', // Ortto engagement platform
  'https://js.arcgis.com', // ArcGIS maps
  'https://code.jquery.com', // jQuery CDN
  'https://dpptfqp76xood.cloudfront.net', // CloudFront assets (ionRange.js)
  "'unsafe-inline'", // Allow inline scripts (consider removing for better security)
  "'unsafe-eval'", // Required for webpack and dynamic script evaluation
];

/**
 * @function setHelmetHeaders
 * @summary Configure hemlet to secure express headers
 * @param {Express.Application} app
 */
const configureHelmetHeaders = (app: Application) => {
  /**
   * Default middleware used is:
   * dnsPrefetchControl - controls browser DNS prefetching
   * frameguard - to prevent clickjacking
   * hidePoweredBy - to remove the X-Powered-By header
   * hsts - for HTTP Strict Transport Security (prod/staging only)
   * noSniff - to keep clients from sniffing the MIME type
   * xssFilter - adds some small XSS protections
   */
  const enableHSTS = !['development', 'test'].includes(process.env.NODE_ENV);

  // Configure HSTS settings based on environment
  const helmetConfig: any = {};
  if (enableHSTS) {
    helmetConfig.hsts = {
      maxAge: 31536000, // 1 year expiration
      includeSubDomains: true,
      preload: true,
    };
  } else {
    // Disable HSTS in development and unit test environments
    helmetConfig.hsts = false;
  }

  app.use(helmet(helmetConfig));
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: CSP_SCRIPT_SOURCES,
        workerSrc: ["'self'", 'blob:'], // Required for Osano and other web workers
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:', 'wss://*.zendesk.com', 'wss://ws.hotjar.com'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
      },
    })
  );
  // Set Permissions-Policy header manually (Helmet v8 does not provide this middleware)
  app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=*, payment=()');
    next();
  });
};

/**
 * @function configureStaticAssetPath
 * @summary Configure static assets
 * @param {Express.Application} app
 */
const configureStaticAssetPath = (app: Application) => {
  app.use(express.static('public'));
};

/**
 * @function configureServerRoutes
 * @summary Configure valid express server routes
 * @param {Express.Application} app
 */
const configureServerRoutes = (app: Application, limiter: any) => {
  config.files.routes.forEach((route: string) => {
    const routeModule = require(path.resolve(route));
    // This allows to gradually migrate route files from CommonJS to ESM.
    const handler = routeModule.default || routeModule;
    handler(app, limiter);
  });
};

/**
 * @function configureSplashPage
 * @summary After SPLASH_PAGE_DATE, render the retirement splash page (React
 *          view + minimal splashLayout.pug) for all page routes. API routes are
 *          skipped so health checks and programmatic clients keep working.
 * @param {Express.Application} app
 */
const configureSplashPage = (app: Application) => {
  app.use(
    createSplashPageMiddleware({
      date: process.env.SPLASH_PAGE_DATE,
      enabled: process.env.SPLASH_PAGE_ENABLED,
      renderSplash: (res: Response) => {
        const Splash = compiledAssets.js['splash-component']
          ? (compiledAssets.js['splash-component'] as { default: unknown }).default
          : null;
        const markup = Splash ? renderToString(createElement(Splash as React.ComponentType)) : '';
        return res.status(200).render('splash', {
          title: 'GFW Pro has closed | Global Nature Watch',
          description: 'GFW Pro has retired. Transition to Global Nature Watch.',
          splashjs: compiledAssets.js.splash,
          splashcss: compiledAssets.css.splash,
          markup,
        });
      },
    })
  );
};

/**
 * @function configureErrorRoutes
 * @summary Configure 500 and 404 error routes
 * @param {Express.Application} app
 */
const configureErrorRoutes = (app: Application) => {
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (!err) {
      return next();
    }
    // Log the error and respond with 500
    // If err is empty object, print current stack for debugging
    const errObjVal =
      typeof err === 'object' && Object.keys(err).length === 0 ? new Error('fake err').stack : err;
    logger.error('Unexpected server error', err.stack || errObjVal);
    res
      .status(500)
      .render('500', { status: 500, type: 'server-error', message: 'Unexpected server error' });
  });
  // Nothing has responded so this is assumed to be a 404 error
  app.use((req, res) => {
    logger.error('The requested resource was not found', req.path);
    res.status(404).render('404', {
      status: 404,
      type: 'not-found',
      message: 'The requested resource was not found',
    });
  });
};

// Redis based limiter suitable for all server routes
// The passed in limitConfig object specifies the windowMs and max values and is typically
// either middlewares.rateLimitAuthenticated or middlewares.rateLimitUnauthenticated
const redisBasedLimiter = (limitConfig) => {
  return expressRateLimit.rateLimit({
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    validate: { trustProxy: false }, // Don't complain about ERR_ERL_PERMISSIVE_TRUST_PROXY

    // Redis store configuration
    store: new redisRateLimit.RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),

    // Configure windowMs and max based on the passed in limitConfig
    ...limitConfig,
  });
};

/**
 * @name initialize
 * @static
 * @summary Initialize express
 * @param {Express.Application} app
 * @return {Promise}
 */
export const initialize = (app: Application) => {
  return new Promise((resolve, reject) => {
    logger.info('Initializing express');
    try {
      // Configure middleware
      configureMiddleware(app);
      // Configure locals
      configureLocalVariables(app);
      // Configure view engine (pug)
      configureViewEngine(app);
      // Configure sessions with MongoStore
      configureSession(app); //TODO: Bake in a DB connection to our SQL Server via its API
      // Log slow requests must come after configureSession so it can log session info
      app.use(slowRequestLogger(10 * 1000));
      // Configure passport
      // configurePassport(app); //TODO: Bake in security via AWS Cognito, nothing to do with Mongo or mongoose
      // Configure Helmet security headers
      configureHelmetHeaders(app);
      // Apply error sanitization middleware to strip sensitive systemMessage from responses
      app.use(errorSanitizationMiddleware);
      // Set path for static assets
      configureStaticAssetPath(app);
      // Serve the retirement splash page after the configured date
      configureSplashPage(app);
      // Configure the server routes
      const limiter = rateLimiterUtil.useRateLimiter() ? redisBasedLimiter : null;
      configureServerRoutes(app, limiter);
      // Configure the error routes
      configureErrorRoutes(app);
      // Resolve App
      resolve(app);
    } catch (err) {
      logger.error('Error initializing express', err);
      reject(err);
    }
  });
};
