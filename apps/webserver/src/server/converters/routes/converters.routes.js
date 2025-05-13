/* eslint-disable import/no-dynamic-require */
const path = require('path');
const controller = require('../controllers/converters.controller');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

/**
 * @name exports
 * @static
 * @summary Converters Routes
 */
module.exports = (app, limiter) => {
  const routeMiddlewares = [middlewares.checkProManagerAuthentication];
  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  /**
   * @route GET /converters
   * @desc Returns a list of available converters
   * @access Pro Manager only
   */
  app.get('/converter/all', middlewares.checkProManagerAuthentication, controller.getConverters);
};
