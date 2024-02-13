const path = require('path');
const moment = require('moment');
const AWS = require('aws-sdk');
const sqsUtils = require(path.resolve('./config/privateutils/sqs.utils'));
const { compiledAssets } = require(path.resolve('./config/config'));
const {
  getOrganizationAnalysisUsage,
  getAnalysisLimitData,
} = require('../service/analytics.service');
const { getCurrentDateTimeFormatted } = require('../../vectorTiles/utils/vectorTile.utils');
import { getAccountUsagePercentage } from '@wri-monorepos/shared';
import { getAccountUsersAnalysisUsage, getAccountActivatedTime } from '@wri-monorepos/sql';
import { analysisTypes } from '@wri-monorepos/constants';

/**
 * @function analytics
 * @summary
 * @name exports.analytics
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.analytics = (req, res) => {
  res.render('analytics', {
    common: compiledAssets.js.common,
    analyticsjs: compiledAssets.js.analytics,
    analyticscss: compiledAssets.css.analytics,
  });
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const checkStartBeforeEnd = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

const getAnalysisUsageData = async ({ startDate, endDate, organizationId }) => {
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
  const result = await getOrganizationAnalysisUsage({
    startDate,
    endDate,
    organizationId,
  });

  return {
    status: 200,
    message: result,
  };
};

exports.getOrganizationAnalysisUsage = async (req, res) => {
  let { startDate, endDate, organizationId } = req.query;

  const { status, message } = await getAnalysisUsageData({
    startDate,
    endDate,
    organizationId,
  });

  res.status(status).send(message);
};

exports.getMyOrganizationAnalysisUsage = async (req, res) => {
  let { startDate, endDate } = req.query;

  const { status, message } = await getAnalysisUsageData({
    startDate,
    endDate,
    organizationId: req.session.organization_id,
  });

  res.status(status).send(message);
};

exports.getMyOrganizationUsersAnalysisUsage = async (req, res) => {
  let { startDate, endDate } = req.query;
  const { organization_database: orgDbName } = req.session;

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

exports.getMyOrganizationAnalysisUsagePercentage = async (req, res) => {
  let { organization_id, subscription_status_id } = req.session;

  const accountUsagePercentage = await getAccountUsagePercentage({
    organizationId: organization_id,
    subscriptionStatusId: subscription_status_id,
  });

  res.status(200).send({
    accountUsagePercentage,
  });
};

exports.getOrganizationAnalysisLimit = async (req, res) => {
  const { organizationId, organizationType } = req.query;

  const response = await getAnalysisLimitData({
    organizationId,
    organizationType,
  });

  res.status(200).send(response);
};

exports.getMyOrganizationAnalysisOptions = (req, res) => {
  res.status(200).send(Object.values(analysisTypes));
};

exports.downladOrganizationUsersUsageExport = async (req, res) => {
  const {
    organization_database: orgDbName,
    user_email: userEmail,
    organization_id: orgId,
  } = req.session;

  const orgActivatedTime = await getAccountActivatedTime(orgId);
  const todayAsEndDay = moment().add(1, 'day');
  const accountActivationDate = moment(orgActivatedTime);
  const accountLatestYearStartDate = todayAsEndDay
    .clone()
    .subtract(moment().diff(accountActivationDate, 'days') % 365, 'days');

  const startDate = accountLatestYearStartDate.format('YYYY-MM-DD');
  const endDate = todayAsEndDay.format('YYYY-MM-DD');

  const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  };
  AWS.config.update(awsConfig);

  const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

  const currentDate = getCurrentDateTimeFormatted(); // 20240129_131020
  const fileName = `AccountUsersUsage-from-${startDate}-to-${endDate}-${currentDate}.csv`;
  const messageAttributes = {
    userEmail: {
      DataType: 'String',
      StringValue: userEmail,
    },
    organizationDatabase: {
      DataType: 'String',
      StringValue: orgDbName,
    },
    startDate: {
      DataType: 'String',
      StringValue: startDate,
    },
    endDate: {
      DataType: 'String',
      StringValue: endDate,
    },
    key: {
      DataType: 'String',
      StringValue: fileName,
    },
    type: {
      DataType: 'String',
      StringValue: 'accountUsersUsage',
    },
  };

  const message = {
    MessageAttributes: messageAttributes,
    MessageBody: JSON.stringify(messageAttributes),
    MessageDeduplicationId: sqsUtils.uniqueIdGenerator(),
    MessageGroupId: sqsUtils.uniqueIdGenerator(),
    QueueUrl: process.env.AWS_TMP_QUEUE,
  };

  const sendSqsMessage = await sqs.sendMessage(message).promise();
  return res.status(201).send(sendSqsMessage);
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
