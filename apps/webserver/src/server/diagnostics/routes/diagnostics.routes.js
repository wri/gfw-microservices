const path = require('path');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const dataController = require('../controllers/diagnosticsDataController.controller');
const renderController = require('../controllers/diagnosticsRenderer.controller');
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

module.exports = (app, limiter) => {
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/diagnostics', routeMiddlewares);

  app.get('/diagnostics', renderController.diagnosticsRenderer);

  app.post('/diagnosticsData', dataController.diagnosticsDataController);

  app.get('/AFIDiagnostics/:listId', dataController.AFIDeforestationKPIsController);
};
