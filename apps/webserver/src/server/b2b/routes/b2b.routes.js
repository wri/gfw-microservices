const path = require('path');

const { compiledAssets } = require(path.resolve('./config/config'));

const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

/**
 * @name exports
 * @static
 * @summary b2b page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /b2b
   * @see b2b.controller
   * @memberof Router
   */

  // All methods must under /b2b must pass through middleware
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/b2b', routeMiddlewares);

  app.get('/b2b', (req, res) => {
    console.log('GET /b2b');
    res.render('b2b', {
      common: compiledAssets.js.common,
      b2bjs: compiledAssets.js.b2b,
      b2bcss: compiledAssets.css.b2b,
    });
  });
};
