import middlewares from '../../../config/publicutils/middlewares';
import { diagnosticsRenderer } from '../controllers/diagnosticsRenderer.controller';
import * as rateLimiterUtil from '../../../config/lib/limiter-util';
import { diagnosticsListController } from '../controllers/diagnosticsListController';

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
  app.get('/diagnostics', diagnosticsRenderer);

  app.post('/diagnostics/:listId', diagnosticsListController);
};
