import * as controller from '../controllers/profile.controller';
import * as express from 'express';
import axios from 'axios';
import slackUtils from '../../../config/privateutils/slackNotifications.utils';
import middlewares from '../../../config/publicutils/middlewares';
import * as UserManager from '../../../config/publicutils/userManager.utils';
import * as AccountManager from '../../../config/publicutils/accountManager.utils';
import * as PolicyManager from '../../../config/publicutils/policyManager.utils';
import rateLimiterUtil from '../../../config/lib/limiter-util';
import * as logger from '../../../config/privateutils/logger.utils';
import {
  validateRequest,
  updateUserSchema,
} from '../../../config/publicutils/validation.middleware';

const BASE_URL = '/profile'; // Used to compose API calls to EAPI Microservice
const API_BASE_URL = `/api${BASE_URL}`; // Used for API calls, mostly for routes that return JSON and call the EAPI microservice
const eapiRoutes = express.Router();

/**
 * @name exports
 * @static
 * @summary Profile page routes
 */
export = (app, limiter) => {
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
    logger.info('POST /profile/activateUser');
    const { id, email, first_name, last_name } = req.body;

    UserManager.activateUser(req, id, email, first_name, last_name)
      .then(() => {
        res.send({ redirect: '/profile' });
      })
      .catch(async (err) => {
        logger.error('POST /profile/activateUser', err);

        const { user_id, user_email, organization_id, user_first_name, user_last_name } =
          req.session;

        const slackMessage = slackUtils.buildSlackNotificationMessage({
          url: 'POST /profile/activateUser',
          stackTrace: JSON.stringify(err),
          userInfo: {
            id: user_id,
            email: user_email,
            OrgID: organization_id,
            first_name: user_first_name,
            last_name: user_last_name,
          },
          browserInfo: '',
        });

        await slackUtils.sendNotification(slackMessage);
        res.status(500).send(err);
      });
  });

  app.post('/profile/deactivateUser', (req, res) => {
    logger.info('POST /profile/deactivateUser');
    const { name } = req.body;
    UserManager.deactivateUser(req, name)
      .then(() => {
        res.send({ redirect: '/profile' });
      })
      .catch(async (err) => {
        logger.error('POST /profile/deactivateUser', err);

        const { user_id, user_email, organization_id, user_first_name, user_last_name } =
          req.session;

        const slackMessage = slackUtils.buildSlackNotificationMessage({
          url: 'POST /profile/deactivateUser',
          stackTrace: JSON.stringify(err),
          userInfo: {
            id: user_id,
            email: user_email,
            OrgID: organization_id,
            first_name: user_first_name,
            last_name: user_last_name,
          },
          browserInfo: '',
        });

        await slackUtils.sendNotification(slackMessage);
        res.status(500).send(err);
      });
  });

  app.post('/profile/updateAccount', (req, res) => {
    logger.info('POST /profile/updateAccount');
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
        logger.info('updateAccountProfile: Success', result);
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
        logger.error('POST /profile/updateAccount [updateAccountProfile]', err);
        res.send(err);
      });
  });

  app.post('/profile/createuser', (req, res) => {
    logger.info('POST /profile/createuser');
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
        logger.error('POST /profile/createuser', err);
        res.send(err);
      });
  });

  app.post('/profile/updateuser', validateRequest(updateUserSchema), async (req, res) => {
    logger.info('POST /profile/updateuser');
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
      auth_preference_id,
    } = req.body;

    try {
      const result = await UserManager.updateUserInfo({
        req,
        user_id: id,
        user_first_name: first_name,
        user_middle_initial: middle_initial,
        user_last_name: last_name,
        user_email: email,
        user_phone: phone,
        user_title_id: title_id,
        other_title,
        access_level_id,
        email_subscription: enableAlerts,
        arr_user_geography_ids: geographies,
        arr_user_commodity_ids: commodities,
        user_auth_preference_id: auth_preference_id,
        loggedUserAccessLevelId: req.session.user_access_level_id,
      });
      res.status(200).json(result);
    } catch (err) {
      logger.error('POST /profile/updateuser', err);
      // Map errorUtils.createErrorMessage shape to response
      // Note: systemMessage is excluded to prevent exposing sensitive internal details
      const statusCode = err.errorCode || 500;
      const errorMessage = err.userMessage || err.message || 'Failed to update user information';
      res.status(statusCode).json({
        errorCode: err.errorCode,
        userMessage: errorMessage,
      });
    }
  });

  app.post('/profile/deletePolicy', (req, res) => {
    logger.info('POST /profile/deletePolicy');
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
        logger.error('POST /profile/deletePolicy', err);
        res.send(err);
      });
  });

  app.get('/profile/downloadPolicy/:policyList', (req, res) => {
    logger.info(`GET /profile/downloadPolicy/:policyList`);
    const orgId = req.session.organization_id;
    const policy = req.params.policyList;
    PolicyManager.downloadPolicy(req, policy, orgId)
      .then((filestream) => {
        res.attachment(req.params.policyList);
        filestream.pipe(res);
      })
      .catch((err) => {
        logger.error('GET /profile/downloadPolicy/:policyList', err);
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
        logger.error('POST /userSecret', err);
      });
  });

  const getEAPIMicroserviceUrl = () => {
    // URL Should be the full URL to the EAPI Microservice ending with /api
    const { EAPI_MICROSERVICE_URL } = process.env;
    return EAPI_MICROSERVICE_URL;
  };

  // express behaves differently depending on number of arguments, so need to have "next" argument
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  const runEAPIMicroserviceRequest = async (requestData, request, response, next) => {
    const { method, url, data } = requestData;
    const requestURL = `${getEAPIMicroserviceUrl()}${url}`;
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
      const { status: statusCode = 500, data: error = err } = err.response || {};
      return response.status(statusCode).send(error);
    }
  };

  const runSwaggerRequest = async (request, response) => {
    const requestURL = `${getEAPIMicroserviceUrl()}/profile`;
    try {
      const { data: result } = await axios({
        url: requestURL,
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
        },
      });
      return response.status(200).send(result);
    } catch (err) {
      const { status: statusCode = 500, data: error = err } = err.response || {};
      return response.status(statusCode).send(error);
    }
  };

  app.get(`${API_BASE_URL}/swagger`, [...routeMiddlewares, runSwaggerRequest]);

  app.use(`${API_BASE_URL}/api-keys`, [
    ...routeMiddlewares,
    eapiRoutes,
    runEAPIMicroserviceRequest,
  ]);

  eapiRoutes.post('', (req, res, next) => {
    // this route is used to create a new api key empty body due to the fact that the request body is not used
    const requestOrganizationId = req.session.organization_id;
    const requestUserId = req.session.organization_user_id;
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

  eapiRoutes.get('', (req, res, next) => {
    const requestOrganizationId = req.session.organization_id;

    const request = {
      method: 'GET',
      url: `/api-keys/${requestOrganizationId}`,
    };

    next(request);
  });

  eapiRoutes.delete('/:tokenId', (req, res, next) => {
    const { tokenId } = req.params;
    const requestOrganizationId = req.session.organization_id;
    const request = {
      method: 'DELETE',
      url: `/api-keys/${requestOrganizationId}/${tokenId}`,
    };

    next(request);
  });
};
