const arcgisController = require('../controllers/arcgis.controller');

module.exports = (app) => {
  /**
   * @name /arcgis
   * @see arcgis.controller
   * @memberof Router
   */

  app.get(
    '/arcgis/rest/services/services/VectorTileServer/',
    arcgisController.getEsriVectorTileMetadata
  );

  app.get(
    '/arcgis/rest/services/services/VectorTileServer/resources/styles/root.json',
    arcgisController.getEsriVectorTileRoot
  );

  /**
   * Handle Vector Tile PBF Request
   * Expects urls in the format: /arcgis/rest/services/{listID}/VectorTileServer/{Z}/{X}/{Y}.pbf
   */
  app.get(
    '/arcgis/rest/services/:mbtile/VectorTileServer/:z/:x/:y.pbf',
    arcgisController.handleVectorTilePbfRequest
  );
};
