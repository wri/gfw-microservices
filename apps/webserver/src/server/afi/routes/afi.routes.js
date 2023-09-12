const path = require('path');
const express = require('express');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
const downloadController = require('../controllers/downloadController');
const analysisController = require('../controllers/afiAnalysisController');
const eudrRoutes = express.Router();

/**
 * @name exports
 * @static
 * @summary eudr stub
 */
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

  app.use('/api/afi', [...routeMiddlewares, eudrRoutes]);

  eudrRoutes.get('/download', downloadController);
  eudrRoutes.get('/analysis/:listId', analysisController);
};
