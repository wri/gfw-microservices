const path = require('path');
const controller = require('../controllers/profile.controller');
const express = require('express');
const axios = require('axios');

const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const AccountManager = require(path.resolve('./config/publicutils/accountManager.utils'));
const PolicyManager = require(path.resolve('./config/publicutils/policyManager.utils'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

const BASE_URL = '/profile'; // Used to compose API calls to EAPI Microservice
const API_BASE_URL = `/api${BASE_URL}`; // Used for API calls, mostly for routes that return JSON and call the EAPI microservice
const eapiRoutes = express.Router();

/**
 * @name exports
 * @static
 * @summary Profile page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /profile
   * @see profile.controller
   * @memberof Router
   */

  // All methods must under /profile must pass through middleware
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/profile', routeMiddlewares);
  app.get('/profile', controller.profile);

  app.use('/profile/info', routeMiddlewares);
  app.get('/profile/info', controller.profileInfo);

  app.post('/profile/activateUser', (req, res) => {
    console.log('POST /profile/activateUser');
    const { id, email, first_name, last_name } = req.body;

    UserManager.activateUser(req, id, email, first_name, last_name)
      .then((result) => {
        res.send({ redirect: '/profile' });
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.post('/profile/deactivateUser', (req, res) => {
    console.log('POST /profile/deactivateUser');
    const { name, email } = req.body;
    UserManager.deactivateUser(req, name, email)
      .then((result) => {
        res.send({ redirect: '/profile' });
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.post('/profile/updateAccount', (req, res) => {
    const {
      org_name,
      org_address,
      org_website,
      parent_org_name,
      is_subsidiary,
      arr_org_classification_ids,
      policyUploadList,
      policyNames,
      overwrite,
    } = req.body;
    AccountManager.updateAccountProfile(
      req,
      org_name,
      org_address,
      org_website,
      parent_org_name,
      is_subsidiary,
      arr_org_classification_ids
    )
      .then((result) => {
        console.log('updateAccountProfile: Success', result);
        if (policyUploadList.length > 0) {
          PolicyManager.uploadPolicies(req, policyUploadList, policyNames, overwrite).then(
            (policyResult) => {
              res.send({ redirect: '/profile', policyResult });
            }
          );
        } else {
          res.send({ redirect: '/profile', policyResult: [] });
        }
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.post('/profile/createuser', (req, res) => {
    console.log('POST /profile/createuser');
    const {
      first_name,
      middle_initial,
      last_name,
      email,
      phone,
      title_id,
      other_title,
      access_level_id,
      enableAlerts,
      geographies,
      commodities,
    } = req.body;

    UserManager.createNewUser(
      req,
      first_name,
      middle_initial,
      last_name,
      email,
      phone,
      title_id,
      other_title,
      access_level_id,
      enableAlerts,
      geographies,
      commodities
    )
      .then((user_id) => {
        res.send({
          redirect: '/profile',
          user_id,
        });
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.post('/profile/updateuser', (req, res) => {
    console.log('POST /profile/updateuser');
    const {
      id,
      first_name,
      middle_initial,
      last_name,
      email,
      phone,
      title_id,
      other_title,
      access_level_id,
      enableAlerts,
      geographies,
      commodities,
      viirsAlerts,
      gladAlerts,
      formaAlerts,
      terraIAlerts,
      granChacoAlerts,
      auth_preference_id,
    } = req.body;

    UserManager.updateUserInfo(
      req,
      id,
      first_name,
      middle_initial,
      last_name,
      email,
      phone,
      title_id,
      other_title,
      access_level_id,
      enableAlerts,
      geographies,
      commodities,
      viirsAlerts,
      gladAlerts,
      formaAlerts,
      terraIAlerts,
      granChacoAlerts,
      auth_preference_id
    )
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.post('/profile/deletePolicy', (req, res) => {
    const { policySelectedList } = req.body;
    PolicyManager.deletePolicies(req, policySelectedList)
      .then((result) => {
        if (result) {
          res.send('Success');
        } else {
          res.send('Failed');
        }
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.get('/profile/downloadPolicy/:policyList', (req, res) => {
    PolicyManager.downloadPolicy(req, [req.params.policyList])
      .then((filestream) => {
        res.attachment(req.params.policyList);
        filestream.pipe(res);
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.post('/userSecret', middlewares.checkAuthentication, (req, res) => {
    const { email } = req.body;
    UserManager.getUserSecret(req, email)
      .then((secret) => {
        res.send(secret);
      })
      .catch((err) => {
        console.log('Error getting secret', err);
      });
  });

  const getEAPIMicroserviceUrl = () => {
    // URL Should be the full URL to the EAPI Microservice ending with /api
    const { EAPI_MICROSERVICE_URL } = process.env;
    return EAPI_MICROSERVICE_URL;
  };

  const runEAPIMicroserviceRequest = async (requestData, request, response, next) => {
    const { method, url, data } = requestData;
    const requestURL = `${getEAPIMicroserviceUrl()}${url}`;
    console.log('runEAPIMicroserviceRequest', requestURL);
    try {
      const { data: result } = await axios({
        url: requestURL,
        method,
        headers: {
          'Content-type': 'application/json',
        },
        data,
      });
      return response.status(200).send(result);
    } catch (err) {
      const { status: statusCode, data: error } = err.response;
      return response.status(statusCode).send(error);
    }
  };

  app.use(`${API_BASE_URL}`, [...routeMiddlewares, eapiRoutes, runEAPIMicroserviceRequest]);

  eapiRoutes.post('/api-keys', (req, res, next) => {
    // empty body will create a new API key for the current user and organization
    const { organizationId, userId } = req.body;

    const requestOrganizationId = organizationId || req.session.organization_id;
    const requestUserId = userId || req.session.organization_user_id;
    const request = {
      method: 'POST',
      url: '/api-keys',
      data: {
        organizationId: requestOrganizationId,
        userId: requestUserId,
      },
    };

    next(request);
  });

  eapiRoutes.get('/api-keys/:orgId', (req, res, next) => {
    const { orgId } = req.params;

    const request = {
      method: 'GET',
      url: `/api-keys/${orgId}`,
    };

    next(request);
  });

  eapiRoutes.delete('/api-keys/:orgId/:tokenId', (req, res, next) => {
    const { orgId, tokenId } = req.params;

    const request = {
      method: 'DELETE',
      url: `/api-keys/${orgId}/${tokenId}`,
    };

    next(request);
  });
};
