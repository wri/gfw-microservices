const path = require('path');
const express = require('express');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
const createFeatureFlag = require('../controllers/createFeatureFlagRecord');
const getAllFeatureFlags = require('../controllers/getAllFeatureFlags');
const getFeatureFlagByFlagId = require('../controllers/getFeatureFlagByFlagId');

const featureFlagRoutes = express.Router();

module.exports = (app, limiter) => {
  const routeMiddlewares = [
    middlewares.checkAuthentication,
    middlewares.checkOrganization,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/api/feature-flags', [...routeMiddlewares, featureFlagRoutes]);
  featureFlagRoutes.get('/', getAllFeatureFlags);
  featureFlagRoutes.get('/:flagId', getFeatureFlagByFlagId);
  featureFlagRoutes.post('/', createFeatureFlag);
};
