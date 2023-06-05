const middlewares = require('../../../config/publicutils/middlewares');
const rateLimiterUtil = require('../../../config/lib/limiter-util');

const controller = require('../controllers/listData.controller');

module.exports = (app, limiter) => {
  /**
   * @name /listData
   * @see listData.controller
   * @memberof Router
   */

  // All methods under /locations must pass through middleware
  const routeMiddlewares = [
    middlewares.checkAuthentication,
    middlewares.checkOrganization,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  // Implement middlewares check
  app.use('/listData', routeMiddlewares);

  app.get('/listData', controller.listData);

  app.post('/listDataCustom', controller.listDataCustom);
};
