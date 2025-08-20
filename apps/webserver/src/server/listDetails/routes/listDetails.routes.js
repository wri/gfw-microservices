const path = require('path');

const controller = require('../controllers/listDetails.controller');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

/**
 * @name exports
 * @static
 * @summary listDetails page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /list-details
   * @see listDetails.controller
   * @memberof Router
   */

  // All methods under /listDetails must pass through middleware
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/list-details', routeMiddlewares);

  app.get('/list-details', (req, res) => {
    console.log('/list-details');
    controller.listDetails(req, res);
  });
};
