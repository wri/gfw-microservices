const path = require('path');
const express = require('express');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
import insertOrSaveFeatureFlag from '../controllers/insertOrSaveFeatureFlag';
import getTransformedFeatureFlags from '../controllers/getTransformedFeatureFlags';
import getAllFeatureFlags from '../controllers/getAllFeatureFlags';
import getFeatureFlagByFlagId from '../controllers/getFeatureFlagByFlagId';
import deleteFeatureFlag from '../controllers/deleteFeatureFlag';

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
  featureFlagRoutes.get('/', getTransformedFeatureFlags);

  app.use('/api/feature-flags', [...superAdminRoutesMiddlewares, superAdminFeatureFlagsRoutes]);
  superAdminFeatureFlagsRoutes.get('/', getAllFeatureFlags);
  superAdminFeatureFlagsRoutes.get('/:flagId', getFeatureFlagByFlagId);
  superAdminFeatureFlagsRoutes.post('/', insertOrSaveFeatureFlag);
  superAdminFeatureFlagsRoutes.delete('/:flagId', deleteFeatureFlag);
};
