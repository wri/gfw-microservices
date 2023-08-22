const express = require('express');
const path = require('path');
const controller = require('../controllers/analytics.controller');

const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

const analyticsRouter = express.Router();
const myOrgAnalyticsRouter = express.Router();

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
  const routeMiddlewaresAnalytics = [middlewares.checkProManagerAuthentication];

  const routeMiddlewaresMyOrg = [
    middlewares.checkAuthentication,
    middlewares.checkOrganization,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewaresAnalytics.push(limiter(middlewares.rateLimitAuthenticated));
    routeMiddlewaresMyOrg.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/analytics/myorg', [...routeMiddlewaresMyOrg, myOrgAnalyticsRouter]);

  app.use('/analytics', [...routeMiddlewaresAnalytics, analyticsRouter]);

  app.get('/analytics', controller.analytics);

  analyticsRouter.get('/usage', controller.getOrganizationAnalysisUsage);

  analyticsRouter.get('/limit', controller.getOrganizationAnalysisLimit);

  myOrgAnalyticsRouter.get('/usage', controller.getMyOrganizationAnalysisUsage);

  myOrgAnalyticsRouter.get('/listsAnalysisStatus', controller.getListsAnalysisStatus);
};
