const express = require('express');
const path = require('path');
const controller = require('../controllers/analytics.controller');

const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

const analyticsRouter = express.Router();

/**
 * @name exports
 * @static
 * @summary Analytics page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /analytics
   * @see analytics.controller
   * @memberof Router
   */

  // All methods must under /analytics must pass through middleware
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
    middlewares.checkProManagerAuthentication,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/analytics', [...routeMiddlewares, analyticsRouter]);

  app.get('/analytics', controller.analytics);

  analyticsRouter.get('/usage', controller.getOrganizationAnalysisUsage);
};
