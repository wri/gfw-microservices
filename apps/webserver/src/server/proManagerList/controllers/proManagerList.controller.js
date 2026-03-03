const path = require('path');
import config from '../../../config/config';
const { compiledAssets } = config;

// Utils
const { ERROR_CODES } = require('../../../config/privateutils/error.utils');
const AccountManager = require(path.resolve('./config/publicutils/accountManager.utils'));
const ProManager = require(path.resolve('./config/publicutils/proManager.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const PolicyManager = require(path.resolve('./config/publicutils/policyManager.utils'));
const logger = require(path.resolve('./config/privateutils/logger.utils'));

const { orgAccountStatus } = require(path.resolve('./config/env/orgAccountStatus.constants'));

import {
  aggregateLimits,
  getAccountSubscriptionLimits,
  getAccountExtraLimits,
  combineOrganizationLimits,
  getAccountRolloverLimits,
} from '@wri-monorepos/shared';

import { getAccountRenewalTime } from '@wri-monorepos/sql';

/**
 * @function proManagerList
 * @param {Express.Request} req - Express request object
 * @param res - Express response object
 */
export const proManagerList = (req, res) => {
  res.render('proManagerList', {
    common: compiledAssets.js.common,
    proManagerListjs: compiledAssets.js.proManagerList,
    proManagerListcss: compiledAssets.css.proManagerList,
  });
};

const getUserFromQuery = (userId, organizationId, accounts, users) => {
  const selectedUser = users.find(
    (user) => user.user_id === userId && user.organization_id === organizationId
  );
  if (selectedUser) {
    const selectedOrganization = accounts.find(
      (account) => account.organization_id === organizationId
    );
    selectedUser.org_status = selectedOrganization.organization_status_id;
  }

  return selectedUser || null;
};

const getAccountFromQuery = (organizationId, accounts) => {
  const selectedAccount =
    accounts.find((account) => account.organization_id === organizationId) ?? null;
  return selectedAccount;
};

export const proManagerListAccountsData = (req, res) => {
  const classes = AccountManager.getClassifications(req);
  const statusData = UserManager.getStatuses(req);

  const promises = [ProManager.getAllAccountsList(req)];

  Promise.all(promises)
    .then(([accounts]) => {
      res.status(200).json({
        accounts,
        classes,
        statusData,
      });
    })
    .catch((error) => {
      console.log('Pro-manager-list page failed on the server:', error);
      res.status(500).send(error);
    });
};

export const proManagerListAccountDetailData = async (req, res) => {
  const { organizationId: organizationIdParam } = req.params;

  const organizationId = parseInt(organizationIdParam, 10);
  const classes = AccountManager.getClassifications(req);
  const accessData = UserManager.getAccessLevels(req);
  const statusData = UserManager.getStatuses(req);

  const promises = [
    ProManager.getAllAccountsList(req),
    ProManager.getAllUsersList(req),
    PolicyManager.getPendingPolicyList(req),
    PolicyManager.getAllPolicyList(req),
  ];

  try {
    const [accounts, users, pendingPolicy, allPolicy] = await Promise.all(promises);

    const policyList = pendingPolicy.concat(allPolicy);
    let selectedAccount = getAccountFromQuery(organizationId, accounts);

    /**
     * @update
     *
     * With the new subscription model, every account that is not pending,
     * should have an object representing their limit from their subscription and their purchase
     *
     * @see GPV-2228
     */
    if (selectedAccount) {
      selectedAccount.renewal_time = await getAccountRenewalTime(selectedAccount.organization_id);

      if (selectedAccount.organization_status_id !== orgAccountStatus.Pending) {
        const subscribedPerYear = await getAccountSubscriptionLimits(
          selectedAccount.subscription_status_id,
          selectedAccount.renewal_time
        );
        const subscribed = aggregateLimits(subscribedPerYear);
        const extended = await getAccountExtraLimits(selectedAccount.organization_id);
        const rollover = await getAccountRolloverLimits(
          selectedAccount.organization_id,
          subscribed,
          extended,
          selectedAccount.renewal_time
        );

        const limits = combineOrganizationLimits(subscribed, rollover);

        selectedAccount.analysis_limits = {
          limits,
          subscriptionLimits: subscribed,
          extraLimits: rollover,
        };
      } else {
        selectedAccount.analysis_limits = null;
      }
    }

    res.status(200).json({
      users,
      classes,
      statusData,
      accessData,
      policyList,
      selectedAccount,
    });
  } catch (error) {
    logger.error('Pro-manager-list account-detail page failed on the server', { error });
    res.status(500).send(error);
  }
};

export const proManagerListUsersData = (req, res) => {
  const accessData = UserManager.getAccessLevels(req);
  const statusData = UserManager.getStatuses(req);

  const promises = [ProManager.getAllUsersList(req)];

  Promise.all(promises)
    .then(([users]) => {
      res.status(200).json({
        users,
        statusData,
        accessData,
      });
    })
    .catch((error) => {
      console.log('Pro-manager-list page failed on the server:', error);
      res.status(500).send(error);
    });
};

export const proManagerListUserDetailData = (req, res) => {
  const classes = AccountManager.getClassifications(req);
  const commoditiesData = UserManager.getCommodities(req);
  const geographiesData = UserManager.getGeographies(req);
  const titlesData = UserManager.getTitles(req);
  const { userId: userIdQuery, organizationId: organizationIdQuery } = req.params;

  const userId = parseInt(userIdQuery, 10);
  const organizationId = parseInt(organizationIdQuery, 10);

  const promises = [ProManager.getAllAccountsList(req), ProManager.getAllUsersList(req)];

  Promise.all(promises)
    .then(([accounts, users]) => {
      const selectedUser = getUserFromQuery(userId, organizationId, accounts, users);

      res.status(200).json({
        classes,
        commoditiesData,
        geographiesData,
        titlesData,
        selectedUser,
      });
    })
    .catch((error) => {
      console.log('Pro-manager-list page failed on the server:', error);
      res.status(500).send(error);
    });
};

export const activatePendingAccount = async (req, res) => {
  logger.info('POST /pro-manager/activatePendingAccount');
  const { id } = req.body;

  try {
    await ProManager.activatePendingAccount(req, id);
    res.status(200).send({ redirect: '/pro-manager-list' });
  } catch (error) {
    logger.error('Error POST /pro-manager/activatePendingAccount', error);

    switch (error.code) {
      case ERROR_CODES.failedToActivateAccount:
        res.status(400).send({
          errorCode: error.code,
          systemMessage: error.systemMessage,
          userMessage: error.userMessage,
        });
        break;

      case ERROR_CODES.userNotProManager:
        res.status(403).send({
          errorCode: error.code,
          systemMessage: error.systemMessage,
          userMessage: error.userMessage,
        });
        break;

      default:
        res.status(500).send({
          errorCode: 'internalServerError',
          systemMessage: error,
          userMessage: 'An unexpected error occurred. Please try again later.',
        });
    }
  }
};

export const reactivateAccount = async (req, res) => {
  logger.info('POST /pro-manager/reactivateAccount');
  const { id } = req.body;

  try {
    await ProManager.reactivateAccount(req, id);
    res.send({ redirect: '/pro-manager-list' });
  } catch (error) {
    logger.error('Error in POST /pro-manager/reactivateAccount', error);
    res.status(500).send({
      error: 'Failed to reactivate account.',
      details: error,
    });
  }
};

export const deactivateAccount = async (req, res) => {
  logger.info('POST /pro-manager/deactivateAccount');
  const { id } = req.body;

  try {
    await ProManager.deactivateAccount(req, id);
    res.status(200).send({ redirect: '/pro-manager-list' });
  } catch (error) {
    logger.error(`Error POST /pro-manager/deactivateAccount`, error);

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
};

export const closePendingAccount = async (req, res) => {
  logger.info('POST /pro-manager/closePendingAccount');
  const { id } = req.body;

  ProManager.closePendingAccount(req, id)
    .then(() => {
      res.send({ redirect: '/pro-manager-list' });
    })
    .catch((error) => {
      logger.info(`Error POST /pro-manager/closePendingAccount`, error);
      res.send(error);
    });
};

export const updateProAccount = async (req, res) => {
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
};
