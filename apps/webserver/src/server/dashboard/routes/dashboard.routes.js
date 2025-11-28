const path = require('path');
const controller = require('../controllers/dashboard.controller');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
const { featureFlagsService } = require('@wri-monorepos/shared');

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

  // Middleware to check feature flag and return 404 if enabled
  const checkDashboardDisabled = async (request, response, next) => {
    try {
      const { organization_id } = request.session;
      if (!organization_id) {
        return next();
      }

      const { getFeatureFlagsForCurrentOrg } = await featureFlagsService();
      const flags = await getFeatureFlagsForCurrentOrg(organization_id);
      console.log('Dashboard feature flags:', flags);

      const isDashboardDisabled = flags.some((f) => f.flagId === 'Dcf' && f.flagState === true);

      if (isDashboardDisabled) {
        return response.status(404).render('404', {
          status: 404,
          type: 'not-found',
          message: 'The requested resource was not found',
        });
      }

      next();
    } catch (error) {
      console.error('Error checking dashboard feature flag:', error);
      next();
    }
  };

  // All methods must under /dashboard must pass through middleware
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
    checkDashboardDisabled,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/dashboard', routeMiddlewares);

  app.get('/dashboard', controller.dashboard);
};
