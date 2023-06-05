const middlewares = require('../../../config/publicutils/middlewares');
const rateLimiterUtil = require('../../../config/lib/limiter-util');
const vectorTilesController = require('../controllers/vectorTiles.controller');

module.exports = (app, limiter) => {
  /**
   * @name /vectorTile
   * @see vectorTile.controller
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
  app.use('/vectorTile', routeMiddlewares);

  app.post('/vectorTile/generateTiles', vectorTilesController.generateTiles);

  app.get('/vectorTile/:id', vectorTilesController.retrieveTiles);

  app.post('/vectorTile/getListMbtileInfo', vectorTilesController.getListMbtileInfo);
};
