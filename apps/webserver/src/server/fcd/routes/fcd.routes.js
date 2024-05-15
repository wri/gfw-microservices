const path = require('path');
const express = require('express');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
const fcdRoutes = express.Router();
import fcdController from '../controllers/fcdController';

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

  app.use('/api/fcd', [...routeMiddlewares, fcdRoutes]);

  fcdRoutes.get('', fcdController);
};
