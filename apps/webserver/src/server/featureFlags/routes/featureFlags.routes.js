const path = require('path');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
const { isAfiAvailable } = require(path.resolve('./server/featureFlags/utils/isAfiAvailable'));

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

  app.use('/api/feature-flags', routeMiddlewares);

  app.get('/api/feature-flags', (req, res) => {
    res.status(200).json({
      isAfiAvailable: isAfiAvailable(organization_id) ?? false,
      isArgentinaComplianceAvailable: isArgentinaComplianceAvailable(organization_id) ?? false,
    });
  });
};
