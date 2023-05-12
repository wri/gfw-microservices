const middlewares = require('../../../config/publicutils/middlewares');
const rateLimiterUtil = require('../../../config/lib/limiter-util');
const arcgisController = require('../controllers/arcgis.controller');

module.exports = (app, limiter) => {
  /**
   * @name /arcgis
   * @see arcgis.controller
   * @memberof Router
   */

  // All methods under /arcgis must pass through middleware
  // TODO: check if this is needed
  const routeMiddlewares = [
    middlewares.checkAuthentication,
    middlewares.checkOrganization,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  // if (rateLimiterUtil.useRateLimiter()) {
  //   routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  // }

  // Implement middlewares check
  // app.use('/arcgis', routeMiddlewares);

  app.get('/arcgis/rest/services/services/VectorTileServer/', arcgisController.getEsriVectorTileMetadata);

  app.get(
    '/arcgis/rest/services/services/VectorTileServer/resources/styles/root.json',
    arcgisController.getEsriVectorTileRoot
  );

  /**
   * Handle Vector Tile PBF Request
   * Expects urls in the format: /arcgis/rest/services/{listID}/VectorTileServer/{Z}/{X}/{Y}.pbf
   */
  app.get('/arcgis/rest/services/:mbtile/VectorTileServer/:z/:x/:y.pbf', arcgisController.handleVectorTilePbfRequest);
};
