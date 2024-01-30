const path = require('path');
const axios = require('axios');
const express = require('express');

const { compiledAssets } = require(path.resolve('./config/config'));

const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

const invitationController = require('../controllers/invitation.controller');
const connectionController = require('../controllers/connection.controller');

const b2bRoutes = express.Router();
import { UserAccessLevel } from '@wri-monorepos/shared';

const BASE_URL = '/b2b'; // Used for rendering the page, mostly for routes that render pug templates
const API_BASE_URL = `/api${BASE_URL}`; // Used for API calls, mostly for routes that return JSON and call the B2B microservice

const PREMIUM_ACCOUNT_CODE = 2;

/**
 * @name exports
 * @static
 * @summary b2b page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /b2b
   * @see b2b.controller
   * @memberof Router
   */

  // All methods must under /b2b must pass through middleware
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  const getB2BUrl = () => {
    const { B2B_MICROSERVICE_URL } = process.env;
    return B2B_MICROSERVICE_URL;
  };

  const runB2BRequest = async (requestData, request, response, next) => {
    const { method, url, data, mapper } = requestData;
    const newUrl = `${getB2BUrl()}${url}`;

    try {
      const { data: result } = await axios({
        url: newUrl,
        method,
        headers: {
          'Content-type': 'application/json',
        },
        data,
      });
      if (mapper) {
        return response.status(200).send(mapper(result, request.session.organization_id));
      }
      return response.status(200).send(result);
    } catch (err) {
      const { status: statusCode, data: error } = err.response;
      return response.status(statusCode).send(error);
    }
  };

  const isPremiumAndAdmin = (req, res, next) => {
    // If user is premium or admin, allow access
    if (
      req.session.subscription_status_id === PREMIUM_ACCOUNT_CODE &&
      req.session.user_access_level_id === UserAccessLevel.ADMIN
    ) {
      return next();
    }
    return res.status(403).send({ message: 'Forbidden' });
  };

  app.use(`${API_BASE_URL}`, [...routeMiddlewares, isPremiumAndAdmin, b2bRoutes, runB2BRequest]);

  app.get(`${BASE_URL}`, (req, res) => {
    console.log(`GET ${BASE_URL}`);
    res.render('b2b', {
      common: compiledAssets.js.common,
      b2bjs: compiledAssets.js.b2b,
      b2bcss: compiledAssets.css.b2b,
    });
  });

  // Invitation routes
  b2bRoutes.post('/invitation', invitationController.createInvitation);
  b2bRoutes.post('/invitation/:id', invitationController.resendInvite);

  // Connection routes
  b2bRoutes.get('/orgs/:email', connectionController.getUserOrganizations);
  b2bRoutes.get('/connection', connectionController.getConnections);
  b2bRoutes.put('/connection/accept/:id', connectionController.acceptConnection);
  b2bRoutes.put('/connection/reject/:id', connectionController.rejectConnection);
  b2bRoutes.put('/connection/cancel/:id', connectionController.cancelConnection);

  b2bRoutes.post('/connection/check-user', connectionController.checkUserBelongsToOrgAndIsAdmin);
};
