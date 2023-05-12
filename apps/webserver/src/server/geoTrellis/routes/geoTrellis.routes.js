const controller = require('../controllers/geoTrellis.controller');
const { GEO_TRELLIS_ANALYZE_LIST } = require('../../../config/config/locations.config');

module.exports = (app) => {
  app.post(GEO_TRELLIS_ANALYZE_LIST.route, controller.geoTrellisAnalyzeListController);
};
