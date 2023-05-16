const webpackUtils = require('../publicutils/webpack.utils');
const methodOverride = require('method-override');
const compression = require('compression');
const redis = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const FileStore = require('session-file-store')(session);
const { v1: uuidv1 } = require('uuid');

const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const logger = require('./winston');
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const rateLimiterUtil = require('./limiter-util');
const config = require(path.resolve('./config/config'));
const { PRODUCTION_ENVIRONMENTS } = require('../config/environments.config');

// skip certain things not useful for jest unit testing
const unitTestMode = process.env.NODE_ENV === 'test';

// Updating redis and connect-redis requires syntax change for creating client
// redisClient is provided to new RedisStore({client:redisClient})
// redis v2.8.0 -> v3.1.2
// connect-redis v3.4.2 -> v6.0.0
let redisClient;
if (unitTestMode) {
  redisClient = null;
} else {
  redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
  });
  redisClient.on('error', (info) => {
    console.log('Express redis error', info);
  });
}

/**
 * @function configureMiddleware
 * @summary Configure express middleware
 * @param {Express.app} app
 */
const configureMiddleware = (app) => {
  // Enable stack traces
  app.set('showStackError', true);
  // Enable jsonp via res.jsonp
  app.enable('jsonp callback');
  // Use before static routes applied
  app.use(compression({ level: 9 }));
  // Setup favicon
  app.use(favicon('./server/core/pro-fav.png'));
  // Setup body parser
  app.use(bodyParser.urlencoded({ limit: '1024mb', extended: true }));
  app.use(bodyParser.json({ limit: '1024mb' }));
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
 * @param {Express.app} app
 */
const configureLocalVariables = (app) => {
  app.locals.title = config.app.title;
  app.locals.author = config.app.author;
  app.locals.keywords = config.app.keywords;
  app.locals.description = config.app.description;
};

/**
 * @function configureViewEngine
 * @summary Configure view engine
 * @param {Express.app} app
 */
const configureViewEngine = (app) => {
  // Set the engine and the view paths
  app.set('view engine', 'pug');
  app.set('views', config.files.views);
};

/**
 * @function configureSession
 * @summary Configure express session
 * @param {Express.app} app
 */
const configureSession = (app) => {
  const sessionParams = {
    name: 'gfwpro.globalforestwatch.org',
    saveUninitialized: false,
    secret: config.sessionVars.secret,
    cookie:
      PRODUCTION_ENVIRONMENTS.includes(process.env.NODE_ENV) || process.env.NODE_ENV === 'test'
        ? { secure: false }
        : { secure: true },
    unset: 'destroy',
    resave: false,
    genid: function (req) {
      return uuidv1();
    },
  };
  if (!unitTestMode) {
    sessionParams.store = new RedisStore({ client: redisClient });
  }

  app.use(session(sessionParams));
};

/**
 * @function setHelmetHeaders
 * @summary Configure hemlet to secure express headers
 * @param {Express.app} app
 */
const configureHelmetHeaders = (app) => {
  /**
   * Default middleware used is:
   * dnsPrefetchControl - controls browser DNS prefetching
   * frameguard - to prevent clickjacking
   * hidePoweredBy - to remove the X-Powered-By header
   * hsts - for HTTP Strict Transport Security
   * ieNoOpen - sets X-Download-Options for IE8+
   * noSniff - to keep clients from sniffing the MIME type
   * xssFilter - adds some small XSS protections
   */
  app.use(
    helmet({
      hsts: true, // off until https us working
    })
  );
  /**
   * TODO: Add content security policy configuration via helmet.contentSecurityPolicy({ ... })
   * @see https://github.com/helmetjs/helmet
   */
};

/**
 * @function configureStaticAssetPath
 * @summary Configure static assets
 * @param {Express.app} app
 */
const configureStaticAssetPath = (app) => {
  app.use(express.static('public'));
};

/**
 * @function configureServerRoutes
 * @summary Configure valid express server routes
 * @param {Express.app} app
 */
const configureServerRoutes = (app, limiter) => {
  config.files.routes.forEach((route) => require(path.resolve(route))(app, limiter));
};

/**
 * @function configureErrorRoutes
 * @summary Configure 500 and 404 error routes
 * @param {Express.app} app
 */
const configureErrorRoutes = (app) => {
  app.use((err, req, res, next) => {
    if (!err) {
      return next();
    }
    // Log the error and respond with 500
    logger.error('Unexpected server error', err.stack);
    res.status(500).render('500', { status: 500, type: 'server-error', message: 'Unexpected server error' });
  });
  // Nothing has responded so this is assumed to be a 404 error
  app.use((req, res) => {
    logger.error('The requested resource was not found', req.path);
    res.status(404).render('404', { status: 404, type: 'not-found', message: 'The requested resource was not found' });
  });
};

/**
 * @name initialize
 * @static
 * @summary Initialize express
 * @param {Express.app} app
 * @return {Promise}
 */
module.exports.initialize = (app) =>
  new Promise((resolve, reject) => {
    logger.info('Initializing express');
    try {
      // configure rate limiter - pass to subroutes
      let limiter;
      if (rateLimiterUtil.useRateLimiter()) {
        limiter = require('express-limiter')(app, redisClient);
      }

      // Configure middleware
      configureMiddleware(app);
      // Configure locals
      configureLocalVariables(app);
      // Configure view engine (pug)
      configureViewEngine(app);
      // Configure sessions with MongoStore
      configureSession(app); //TODO: Bake in a DB connection to our SQL Server via its API
      // Configure passport
      // configurePassport(app); //TODO: Bake in security via AWS Cognito, nothing to do with Mongo or mongoose
      // Configure Hemlet security headers
      configureHelmetHeaders(app);
      // Set path for static assets
      configureStaticAssetPath(app);
      // Configure the server routes
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
