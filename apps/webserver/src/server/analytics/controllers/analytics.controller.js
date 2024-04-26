const path = require('path');
const moment = require('moment');
const logger = require('../../../config/privateutils/logger.utils');
const { compiledAssets } = require(path.resolve('./config/config'));
const { getCurrentDateTimeFormatted } = require('../../vectorTiles/utils/vectorTile.utils');
import {
  getAccountExtraLimits,
  getAccountSubscriptionLimits,
  combineOrganizationLimits,
  getAccountUsagePercentage,
  getAccountRolloverLimits,
} from '@wri-monorepos/shared';
import {
  getAccountUsersAnalysisUsage,
  getAccountRenewalTime,
  getAccountAnalysisLimits,
  getAccountAnalysisUsage,
} from '@wri-monorepos/sql';
import { analysisTypes } from '@wri-monorepos/constants';
const { sendMessageToQueue } = require('../../downloader');

/**
 * @function analytics
 * @static
 * @param {Express.Request} req - Express request object
 * @param res - Express response object
 */
export const analytics = (req, res) => {
  res.render('analytics', {
    common: compiledAssets.js.common,
    analyticsjs: compiledAssets.js.analytics,
    analyticscss: compiledAssets.css.analytics,
  });
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.valueOf());
};

const checkStartBeforeEnd = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

const getAnalysisUsageData = async ({ startDate, endDate, organizationId }) => {
  try {
    const { error } = validateQueryParams({
      startDate,
      endDate,
    });
    if (error) {
      return {
        status: 400,
        message: {
          error,
          success: false,
        },
      };
    }
    const result = await getAccountAnalysisUsage({
      startDate,
      endDate,
      organizationId,
    });

    return {
      status: 200,
      message: result,
    };
  } catch (error) {
    return {
      status: 500,
      message: {
        error: error.message,
        success: false,
      },
    };
  }
};

export const getOrganizationAnalysisUsage = async (req, res) => {
  let { startDate, endDate, organizationId } = req.query;

  const { status, message } = await getAnalysisUsageData({
    startDate,
    endDate,
    organizationId,
  });

  res.status(status).send(message);
};

export const getMyOrganizationAnalysisUsage = async (req, res) => {
  let { startDate, endDate } = req.query;

  const { status, message } = await getAnalysisUsageData({
    startDate,
    endDate,
    organizationId: req.session.organization_id,
  });

  res.status(status).send(message);
};

export const getMyOrganizationUsersAnalysisUsage = async (req, res) => {
  const { organization_database: orgDbName, organization_id } = req.session;

  const orgActivatedTime = await getAccountRenewalTime(organization_id);
  const todayAsEndDay = moment().add(1, 'day');
  const accountActivationDate = moment(orgActivatedTime);
  const accountLatestYearStartDate = todayAsEndDay
    .clone()
    .subtract(moment().diff(accountActivationDate, 'days') % 365, 'days');

  const startDate = accountLatestYearStartDate.format('YYYY-MM-DD');
  const endDate = todayAsEndDay.format('YYYY-MM-DD');

  const organizationUsersAnalysisUsage = await getAccountUsersAnalysisUsage(orgDbName, {
    startDate,
    endDate,
  });

  res.status(200).send({
    startDate,
    endDate,
    organizationUsersAnalysisUsage,
  });
};

export const getMyOrganizationAnalysisUsagePercentage = async (req, res) => {
  let { organization_id, subscription_status_id } = req.session;

  try {
    const accountUsagePercentage = await getAccountUsagePercentage({
      organizationId: organization_id,
      subscriptionStatusId: subscription_status_id,
    });

    res.status(200).send({
      accountUsagePercentage,
    });
  } catch (error) {
    logger.error('Error in getMyOrganizationAnalysisUsagePercentage', error);
    res.status(500).send(error);
  }
};

export const getMyOrganizationAnalysisLimit = async (req, res) => {
  const { organization_id, subscription_status_id } = req.session;

  try {
    const subscribed = await getAccountSubscriptionLimits(subscription_status_id);
    const extended = await getAccountExtraLimits(organization_id);
    const rollover = await getAccountRolloverLimits(organization_id, subscribed, extended);

    const limits = combineOrganizationLimits(subscribed, rollover);

    res.status(200).send({
      limits,
      subscribed,
      purchased: rollover,
    });
  } catch (error) {
    logger.error(`GET /analytics/myorg/limits ${error}`);
    res.status(500).send(error);
  }
};

export const getOrganizationAnalysisLimit = async (req, res) => {
  const { organizationId, organizationType } = req.query;

  const response = await getAccountAnalysisLimits({
    organizationId,
    organizationType,
  });

  res.status(200).send([response]);
};

export const getMyOrganizationAnalysisOptions = (req, res) => {
  res.status(200).send(Object.values(analysisTypes));
};

export const downladOrganizationUsersUsageExport = async (req, res) => {
  const {
    organization_database: organizationDatabase,
    user_email: userEmail,
    organization_id: orgId,
  } = req.session;

  const orgActivatedTime = await getAccountRenewalTime(orgId);
  const todayAsEndDay = moment().add(1, 'day');
  const accountActivationDate = moment(orgActivatedTime);
  const accountLatestYearStartDate = todayAsEndDay
    .clone()
    .subtract(moment().diff(accountActivationDate, 'days') % 365, 'days');

  const startDate = accountLatestYearStartDate.format('YYYY-MM-DD');
  const endDate = todayAsEndDay.format('YYYY-MM-DD');

  const currentDate = getCurrentDateTimeFormatted(); // 20240129_131020
  const fileName = `AccountUsersUsage-from-${startDate}-to-${endDate}-${currentDate}.csv`;

  const filters = sendMessageToQueue(
    {
      userEmail,
      organizationDatabase,
      startDate,
      endDate,
      fileName,
    },
    'accountUsersUsage'
  );

  return res.status(201).send({
    success: true,
    message: filters,
  });
};

const validateQueryParams = ({ startDate, endDate }) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return { error: 'Invalid date' };
  }

  if (!checkStartBeforeEnd(startDate, endDate)) {
    return { error: 'Start date must be before end date' };
  }

  return {};
};
