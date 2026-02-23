const { addDays, differenceInDays, format: formatDate } = require('date-fns');
const logger = require('../../../config/privateutils/logger.utils');
import * as sql from 'mssql';
import config from '../../../config/config';
const { compiledAssets } = config;
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
  getAccountAnalysisUsageByAnalysisType,
  SQLUtils,
} from '@wri-monorepos/sql';
import { analysisTypes } from '@wri-monorepos/constants';
const { sendMessageToQueue } = require('../../downloader');
import * as UserManager from '../../../config/publicutils/userManager.utils';

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
  if (!dateString || typeof dateString !== 'string' || dateString.length < 8) {
    return false;
  }
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.valueOf());
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
  const { error } = validateQueryParams({
    startDate,
    endDate,
  });
  if (error) {
    return res.status(400).send({
      status: 400,
      message: {
        error,
        success: false,
      },
    });
  }
  const { status, message } = await getAnalysisUsageData({
    startDate,
    endDate,
    organizationId,
  });

  res.status(status).send(message);
};

export const getMyOrganizationAnalysisUsage = async (req, res) => {
  let { startDate, endDate } = req.query;
  const { error } = validateQueryParams({
    startDate,
    endDate,
  });
  if (error) {
    return res.status(400).send({
      status: 400,
      message: {
        error,
        success: false,
      },
    });
  }
  const { status, message } = await getAnalysisUsageData({
    startDate,
    endDate,
    organizationId: req.session.organization_id,
  });

  res.status(status).send(message);
};

export const getMyOrganizationUsersAnalysisUsage = async (req, res) => {
  try {
    const { organization_database: orgDbName, organization_id } = req.session;
    const { startDate, endDate } = req.query;

    const { error } = validateQueryParams({
      startDate,
      endDate,
    });
    if (error) {
      return res.status(400).send({
        status: 400,
        message: {
          error,
          success: false,
        },
      });
    }

    const orgActivatedTime = await getAccountRenewalTime(organization_id);
    const todayAsEndDay = addDays(new Date(), 1);
    const accountActivationDate = new Date(orgActivatedTime);
    const daysSinceActivation = differenceInDays(new Date(), accountActivationDate);
    const accountLatestYearStartDate = addDays(todayAsEndDay, -(daysSinceActivation % 365));

    const userStartDate =
      typeof startDate === 'undefined' || startDate == null || startDate === ''
        ? formatDate(accountLatestYearStartDate, 'yyyy-MM-dd')
        : startDate;
    const userEndDate =
      typeof endDate === 'undefined' || endDate == null || endDate === ''
        ? formatDate(todayAsEndDay, 'yyyy-MM-dd')
        : endDate;

    const organizationUsersAnalysisUsage = await getAccountUsersAnalysisUsage(orgDbName, {
      startDate: userStartDate,
      endDate: userEndDate,
    });

    res.status(200).send({
      startDate: userStartDate,
      endDate: userEndDate,
      organizationUsersAnalysisUsage,
    });
  } catch (err) {
    logger.error('Error in getMyOrganizationUsersAnalysisUsage', err);
    res.status(500).send({ success: false, error: 'Internal server error.' });
  }
};
export const getMyAccountAnalysisUsageByAnalysisType = async (req, res) => {
  try {
    const { organization_database } = req.session;
    const { startDate, endDate, organizationId } = req.query;
    let orgDbName = organization_database;
    if (orgDbName === null || orgDbName === '' || typeof orgDbName === 'undefined') {
      const { organizationDb } = await SQLUtils.queryDBFirstRow(
        config.SQLConnection.database,
        'getOrganizationDb',
        [{ field: 'organizationId', type: sql.Int, value: organizationId }]
      );
      orgDbName = organizationDb;
    }

    const { error } = validateQueryParams({
      startDate,
      endDate,
    });
    if (error) {
      return res.status(400).send({
        status: 400,
        message: {
          error,
          success: false,
        },
      });
    }

    const analysisUsageByType = await getAccountAnalysisUsageByAnalysisType({
      startDate,
      endDate,
      orgDbName,
    });

    res.status(200).send({
      startDate,
      endDate,
      analysisUsageByType,
    });
  } catch (error) {
    logger.error('Error in getMyAccountAnalysisUsageByAnalysisType', error.stack || error);
    res.status(500).send({
      error: error.message,
      success: false,
    });
  }
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

export const downloadOrganizationUsersUsageExport = async (req, res) => {
  const {
    organization_database: sessionOrgDatabase,
    user_email: userEmail,
    organization_id: sessionOrgId,
  } = req.session;

  let { startDate, endDate, orgId: queryOrgIdStr } = req.query;

  const queryOrgId = parseInt(queryOrgIdStr, 10);
  const isProManager = UserManager.isProManager(req);
  const targetOrgId = queryOrgId || sessionOrgId;

  if (queryOrgId && queryOrgId !== sessionOrgId && !isProManager) {
    return res.status(403).send({
      status: 403,
      message: {
        error: "Unauthorized: Only Pro Managers can access other organizations' data.",
        success: false,
      },
    });
  }

  // Pro Managers must provide orgId
  if (isProManager && !queryOrgId) {
    return res.status(400).send({
      status: 400,
      message: {
        error: 'orgId parameter is required for Pro Managers.',
        success: false,
      },
    });
  }

  // Get the organization database for the target organization
  let organizationDatabase = sessionOrgDatabase;
  if (!organizationDatabase || (queryOrgId && queryOrgId !== sessionOrgId)) {
    const { organizationDb } = await SQLUtils.queryDBFirstRow(
      config.SQLConnection.database,
      'getOrganizationDb',
      [{ field: 'organizationId', type: sql.Int, value: targetOrgId }]
    );
    organizationDatabase = organizationDb;
  }

  if (startDate && endDate) {
    const { error } = validateQueryParams({ startDate, endDate });
    if (error) {
      return res.status(400).send({
        status: 400,
        message: {
          error,
          success: false,
        },
      });
    }
  } else {
    const orgActivatedTime = await getAccountRenewalTime(targetOrgId);
    const todayAsEndDay = addDays(new Date(), 1);
    const accountActivationDate = new Date(orgActivatedTime);
    const daysSinceActivation = differenceInDays(new Date(), accountActivationDate);
    const accountLatestYearStartDate = addDays(todayAsEndDay, -(daysSinceActivation % 365));

    startDate = formatDate(accountLatestYearStartDate, 'yyyy-MM-dd');
    endDate = formatDate(todayAsEndDay, 'yyyy-MM-dd');
  }

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
  if (!startDate) {
    return { error: 'Start date is required and must be a valid date.' };
  }
  if (!endDate) {
    return { error: 'End date is required and must be a valid date.' };
  }
  if (!isValidDate(startDate)) {
    return { error: 'Start date is invalid.' };
  }
  if (!isValidDate(endDate)) {
    return { error: 'End date is invalid.' };
  }
  if (new Date(startDate) > new Date(endDate)) {
    return { error: 'Start date must be before or the same as the end date.' };
  }
  return {}; // No error
};
