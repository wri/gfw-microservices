const path = require('path');
const controller = require('../controllers/login.controller');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

/**
* @name exports
* @static
* @summary Login route
*/
module.exports = (app, limiter) => {
  /**
  * @name /login
  * @see login.controller
  * @memberof Router
  */

  // All methods must under /pro-manager must pass through middleware
  const routeMiddlewares = [];
  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitUnauthenticated));
  }

  app.get('/', routeMiddlewares, controller.login);
};
