/* eslint-disable camelcase */
/* eslint-disable import/no-dynamic-require */
const path = require('path');
const controller = require('../controllers/proManagerList.controller');
const { ERROR_CODES } = require('../../../config/privateutils/error.utils');
const logger = require(path.resolve('./config/privateutils/logger.utils'));
const ProManager = require(path.resolve('./config/publicutils/proManager.utils'));
const PolicyManager = require(path.resolve('./config/publicutils/policyManager.utils'));
const AccountManager = require(path.resolve('./config/publicutils/accountManager.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const GFWListManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

/**
 * @name exports
 * @static
 * @summary Analytics page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /proManagerList
   * @see proManagerList.controller
   * @memberof Router
   */

  // All methods under /pro-manager must pass through middleware
  const routeMiddlewares = [middlewares.checkProManagerAuthentication];
  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/pro-manager', routeMiddlewares);

  app.get(
    '/pro-manager-list',
    middlewares.checkProManagerAuthentication,
    controller.proManagerList
  );

  app.get(
    '/pro-manager-list/accounts/',
    middlewares.checkProManagerAuthentication,
    controller.proManagerListAccountsData
  );

  app.get(
    '/pro-manager-list/accounts/:organizationId/:organizationName',
    middlewares.checkProManagerAuthentication,
    controller.proManagerListAccountDetailData
  );

  app.get(
    '/pro-manager-list/users',
    middlewares.checkProManagerAuthentication,
    controller.proManagerListUsersData
  );

  app.get(
    '/pro-manager-list/users/:organizationId/:userId',
    middlewares.checkProManagerAuthentication,
    controller.proManagerListUserDetailData
  );

  app.post('/pro-manager/activateProAccount', async (req, res) => {
    logger.info('POST /pro-manager/activateProAccount');
    const { id } = req.body;

    try {
      await ProManager.activatePendingAccount(req, id);
      res.status(200).send({ redirect: '/pro-manager-list' });
    } catch (error) {
      logger.error(`Error POST /pro-manager/activateProAccount`, error);

      // Use HTTP status codes based on error type
      if (error.code === ERROR_CODES.failedToActivateAccount) {
        res.status(400).send({
          errorCode: error.code,
          systemMessage: error.systemMessage,
          userMessage: error.userMessage,
        });
      } else if (error.code === ERROR_CODES.userNotProManager) {
        res.status(403).send({
          errorCode: error.code,
          systemMessage: error.systemMessage,
          userMessage: error.userMessage,
        });
      } else {
        res.status(500).send({
          errorCode: 'internalServerError',
          systemMessage: error,
          userMessage: 'An unexpected error occurred. Please try again later.',
        });
      }
    }
  });

  app.post('/pro-manager/activateProActiveAccount', (req, res) => {
    logger.info('POST /pro-manager/activateProActiveAccount');
    const { id } = req.body;
    ProManager.reactivateAccount(req, id)
      .then(() => {
        res.send({ redirect: '/pro-manager-list' });
      })
      .catch((error) => {
        logger.info(`Error POST /pro-manager/activateProActiveAccount`, error);
        res.send(error);
      });
  });

  app.post('/pro-manager/deactivateProAccount', async (req, res) => {
    logger.info('POST /pro-manager/deactivateProAccount');
    const { id } = req.body;

    try {
      await ProManager.deactivateAccount(req, id);
      res.status(200).send({ redirect: '/pro-manager-list' });
    } catch (error) {
      logger.error(`Error POST /pro-manager/deactivateProAccount`, error);

      // Handle specific error codes
      if (error.code === ERROR_CODES.invalidStatusTransition) {
        res.status(400).send({
          errorCode: error.code,
          systemMessage: error.systemMessage,
          userMessage: error.userMessage,
        });
      } else if (error.code === ERROR_CODES.userNotProManager) {
        res.status(403).send({
          errorCode: error.code,
          systemMessage: error.systemMessage,
          userMessage: error.userMessage,
        });
      } else {
        res.status(500).send({
          errorCode: 'internalServerError',
          systemMessage: error,
          userMessage: 'An unexpected error occurred. Please try again later.',
        });
      }
    }
  });

  app.post('/pro-manager/deleteProAccountRequest', (req, res) => {
    logger.info('POST /pro-manager/deleteProAccountRequest');
    const { id } = req.body;

    ProManager.deletePendingAccountRequest(req, id)
      .then(() => {
        res.send({ redirect: '/pro-manager-list' });
      })
      .catch((error) => {
        logger.info(`Error POST /pro-manager/deleteProAccountRequest`, error);
        res.send(error);
      });
  });

  app.post('/pro-manager/updateProAccount', (req, res) => {
    logger.info('POST /pro-manager/updateProAccount');
    const {
      id,
      org_name,
      org_address,
      org_website,
      parent_org_name,
      is_subsidiary,
      arr_org_classification_ids,
      policyUploadList,
      policyName,
      subscription_status_id,
    } = req.body;

    Promise.all([
      AccountManager.updatePendingAccount(
        req,
        id,
        org_name,
        org_address,
        org_website,
        parent_org_name,
        is_subsidiary,
        arr_org_classification_ids,
        policyUploadList,
        policyName
      ),
      PolicyManager.uploadPendingPolicies(req, id, policyUploadList, policyName),
      ProManager.updateAccountSubscriptionStatus(req, id, subscription_status_id),
    ])
      .then(() => {
        res.send({ status: 'success' });
      })
      .catch((error) => {
        logger.info(`Error POST /pro-manager/updateProAccount`, error);
        res.status(500).send(error);
      });
  });

  app.post('/pro-manager/updateProAccountUser', (req, res) => {
    logger.info('POST /pro-manager/updateProAccountUser');
    const {
      id,
      first_name,
      middle_initial,
      last_name,
      email,
      phone,
      title,
      other_title,
      geographies,
      commodities,
    } = req.body;

    ProManager.updatePendingAccountUser(
      req,
      id,
      first_name,
      middle_initial,
      last_name,
      email,
      phone,
      title,
      other_title,
      geographies,
      commodities
    )
      .then(() => {
        res.send({ redirect: '/pro-manager-list' });
      })
      .catch((error) => {
        logger.info(`Error POST /pro-manager/updateProAccountUser`, error);
        res.send(error);
      });
  });

  app.get('/pro-manager/downloadPolicyPro/:policyList/:orgID', (req, res) => {
    const { policyList, orgID } = req.params;

    PolicyManager.downloadPolicy(req, [policyList], [orgID])
      .then((filestream) => {
        res.attachment(policyList);
        filestream.pipe(res);
      })
      .catch((error) => {
        logger.info(`Error POST /pro-manager/downloadPolicyPro/${policyList}/${orgID}`, error);
        res.send(error);
      });
  });

  app.post('/userSecret', middlewares.checkProManagerAuthentication, (req, res) => {
    const { email } = req.body;
    UserManager.getUserSecret(req, email)
      .then((secret) => {
        res.send(secret);
      })
      .catch((error) => {
        logger.info(`Error POST /userSecret`, error);
      });
  });

  app.post('/pro-manager/gfwlists', (req, res) => {
    logger.info('POST /pro-manager/gfwlists');
    const { list_ids } = req.body;

    GFWListManager.updateGFWLists(req, list_ids)
      .then(() => {
        res.send('success');
      })
      .catch((error) => {
        logger.info(`Error POST /pro-manager/gfwlists`, error);
        res.send(error);
      });
  });

  app.post('/pro-manager/updateGlobalAnalysisLimits', async (req, res) => {
    logger.info('POST /pro-manager/updateGlobalAnalysisLimits');
    const {
      MaxAreaPerList = 0,
      MaxAreaAnalyzeablePerYear = 0,
      subscriptionStatusId,
      max_locations_per_year = 0,
    } = req.body;

    try {
      const response = await ProManager.updateGlobalAnalysisLimits(req, {
        subscriptionStatusId,
        MaxAreaPerList,
        MaxAreaAnalyzeablePerYear,
        max_locations_per_year,
      });

      res.send({
        status: 'success',
        data: response,
      });
    } catch (error) {
      logger.info(`Error POST /pro-manager/updateGlobalAnalysisLimits`, error);
      res.status(500).send(error);
    }
  });

  app.post('/pro-manager/updateAccountAnalysisLimits', async (req, res) => {
    logger.info('POST /pro-manager/updateAccountAnalysisLimits');
    const {
      organizationId,
      MaxAreaPerList = 0,
      MaxAreaAnalyzeablePerYear = 0,
      max_locations_per_year = 0,
    } = req.body;

    try {
      const response = await ProManager.updateAccountAnalysisLimits(req, {
        organizationId,
        MaxAreaPerList,
        MaxAreaAnalyzeablePerYear,
        max_locations_per_year,
      });

      res.send({
        status: 'success',
        data: response,
      });
    } catch (error) {
      logger.info(`Error POST /pro-manager/updateAccountAnalysisLimits`, error);
      res.status(500).send(error);
    }
  });
};
