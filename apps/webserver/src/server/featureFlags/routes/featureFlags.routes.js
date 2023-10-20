const path = require('path');
const express = require('express');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
const { isAfiAvailable, isArgentinaComplianceAvailable } = require(path.resolve(
  './server/featureFlags/utils/isFeatureAvailable'
));
const createFeatureFlag = require('../controllers/createFeatureFlagRecord');
const getAllFeatureFlags = require('../controllers/getAllFeatureFlags');
const getFeatureFlagByFlagId = require('../controllers/getFeatureFlagByFlagId');
const featureFlagRoutes = express.Router();

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

  app.use('/api/feature-flags', [...routeMiddlewares, featureFlagRoutes]);
  featureFlagRoutes.get('/api/feature-flags', getAllFeatureFlags);
  featureFlagRoutes.get('/api/feature-flag/:flagId', getFeatureFlagByFlagId);
  featureFlagRoutes.post('/api/feature-flag', createFeatureFlag);

  /**
   * 
  featureFlagRoutes.get('', (req, res) => {
    const { organization_id = '' } = req.session;
    res.status(200).json({
      isAfiAvailable: isAfiAvailable(organization_id) ?? false,
      isArgentinaComplianceAvailable: isArgentinaComplianceAvailable(organization_id) ?? false,
    });
  });
  */
};
