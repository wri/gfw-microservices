const path = require('path');
const express = require('express');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
const insertOrSaveFeatureFlag = require('../controllers/insertOrSaveFeatureFlag');
const getFeatureFlagsForCurrentOrg = require('../controllers/getFeatureFlagsForCurrentOrg');
const getAllFeatureFlags = require('../controllers/getAllFeatureFlags');
const getFeatureFlagByFlagId = require('../controllers/getFeatureFlagByFlagId');
const deleteFeatureFlag = require('../controllers/deleteFeatureFlag');

const featureFlagRoutes = express.Router();
const superAdminFeatureFlagsRoutes = express.Router();

module.exports = (app, limiter) => {
  const routeMiddlewares = [
    middlewares.checkAuthentication,
    middlewares.checkOrganization,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];
  const superAdminRoutesMiddlewares = [middlewares.checkProManagerAuthentication];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/api/feature-flags/myorg', [...routeMiddlewares, featureFlagRoutes]);
  featureFlagRoutes.get('/', getFeatureFlagsForCurrentOrg);

  app.use('/api/feature-flags', [...superAdminRoutesMiddlewares, superAdminFeatureFlagsRoutes]);
  superAdminFeatureFlagsRoutes.get('/', getAllFeatureFlags);
  superAdminFeatureFlagsRoutes.get('/:flagId', getFeatureFlagByFlagId);
  superAdminFeatureFlagsRoutes.post('/', insertOrSaveFeatureFlag);
  superAdminFeatureFlagsRoutes.delete('/:flagId', deleteFeatureFlag);
};
