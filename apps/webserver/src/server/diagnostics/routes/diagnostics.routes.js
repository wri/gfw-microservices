const path = require('path');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const renderController = require('../controllers/diagnosticsRenderer.controller');
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
const diagnosticsListController = require('../controllers/diagnosticsListController');

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

  app.post('/diagnostics/:listId', diagnosticsListController);
};
