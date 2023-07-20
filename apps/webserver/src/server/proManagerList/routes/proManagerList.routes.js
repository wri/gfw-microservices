/* eslint-disable camelcase */
/* eslint-disable import/no-dynamic-require */
const path = require('path');
const controller = require('../controllers/proManagerList.controller');

const ProManager = require(path.resolve('./config/publicutils/proManager.utils'));
const PolicyManager = require(path.resolve('./config/publicutils/policyManager.utils'));
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

  // All methods must under /pro-manager must pass through middleware
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
    '/pro-manager-list/accounts/:organizationId?/:organizationName?',
    middlewares.checkProManagerAuthentication,
    controller.proManagerListAccountsData
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

  app.post('/pro-manager/activateProAccount', (req, res) => {
    console.log('POST /pro-manager/activateProAccount');
    const { id } = req.body;
    ProManager.activatePendingAccount(req, id)
      .then((result) => {
        console.log('ActivateAccount: Success', result);
        res.send({ redirect: '/pro-manager-list' });
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.post('/pro-manager/activateProActiveAccount', (req, res) => {
    console.log('POST /pro-manager/activateProActiveAccount');
    const { id } = req.body;
    ProManager.reactivateAccount(req, id)
      .then(() => {
        res.send({ redirect: '/pro-manager-list' });
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.post('/pro-manager/deactivateProAccount', (req, res) => {
    console.log('POST /pro-manager/deactivateProAccount');
    const { id } = req.body;
    ProManager.deactivateAccount(req, id)
      .then(() => {
        res.send({ redirect: '/pro-manager-list' });
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.post('/pro-manager/deleteProAccountRequest', (req, res) => {
    const { id } = req.body;

    ProManager.deletePendingAccount(req, id)
      .then((result) => {
        console.log('POST /pro-manager/deleteProAccountRequest', result);
        res.send({ redirect: '/pro-manager-list' });
      })
      .catch((err) => {
        res.send(err);
      });
  });

  app.post('/pro-manager/updateProAccount', (req, res) => {
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
    } = req.body;

    ProManager.updatePendingAccount(
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
    )
      .then((result) => {
        console.log('UpdateAccount: Success', result);
        res.send({ redirect: '/pro-manager-list' });
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.post('/pro-manager/updateProAccountUser', (req, res) => {
    console.log('POST /pro-manager/updateProAccountUser');
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
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.get('/pro-manager/downloadPolicyPro/:policyList/:orgID', (req, res) => {
    PolicyManager.downloadPolicy(req, [req.params.policyList], [req.params.orgID])
      .then((filestream) => {
        res.attachment(req.params.policyList);
        filestream.pipe(res);
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.post('/userSecret', middlewares.checkProManagerAuthentication, (req, res) => {
    const { email } = req.body;
    UserManager.getUserSecret(req, email)
      .then((secret) => {
        res.send(secret);
      })
      .catch((err) => {
        console.log('Error getting secret', err);
      });
  });

  app.post('/pro-manager/gfwlists', (req, res) => {
    console.log('POST /pro-manager/gfwlists');
    const { list_ids } = req.body;

    GFWListManager.updateGFWLists(req, list_ids)
      .then(() => {
        res.send('success');
      })
      .catch((err) => {
        console.log('Error /pro-manager/gfwlists', err);
        res.send(err);
      });
  });
};
