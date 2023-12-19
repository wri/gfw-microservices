const path = require('path');
const controller = require('../controllers/dashboard.controller');
const AnalysisManager = require(path.resolve('./config/publicutils/analysisManager.utils'));
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

/**
 * @name exports
 * @static
 * @summary Dashboard page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /dashboard
   * @see dashboard.controller
   * @memberof Router
   */

  // All methods must under /dashboard must pass through middleware
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/dashboard', routeMiddlewares);

  app.get('/dashboard', (req, res) => {
    const fromMap = app.get('from-map');
    controller.dashboard(req, res, fromMap);
    app.set('from-map', false);
  });

  app.post('/dashboard/map-locations', function (req, res) {
    app.set('from-map', true);
    res.send('return');
  });
};
