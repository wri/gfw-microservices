const path = require('path');
const controller = require('../controllers/geoTrellis.controller');
const { GEO_TRELLIS_ANALYZE_LIST } = require('../../../config/config/locations.config');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

module.exports = (app, limiter) => {
  const routeMiddlewaresForOrgs = [
    middlewares.checkAuthentication,
    middlewares.checkOrganization,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewaresAnalytics.push(limiter(middlewares.rateLimitAuthenticated));
  }
  app.use(GEO_TRELLIS_ANALYZE_LIST.route, routeMiddlewaresForOrgs);
  app.post(GEO_TRELLIS_ANALYZE_LIST.route, controller.geoTrellisAnalyzeListController);
};
