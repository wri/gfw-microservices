const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));
const {
  getOrganizationAnalysisUsage,
  getAnalysisLimitData,
} = require('../service/analytics.service');
const { analysisTypes, selectedAnalysesByDefault } = require(path.resolve(
  './config/env/analysisTypes.constants'
));

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

const getAnalysisUsageData = async ({ startDate, endDate, organizationId, countForEachList }) => {
  const { countForEachList: newCountForEachList, error } = validateQueryParams({
    startDate,
    endDate,
    countForEachList,
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
    countForEachList: newCountForEachList,
  });

  return {
    status: 200,
    message: result,
  };
};

exports.getOrganizationAnalysisUsage = async (req, res) => {
  let { startDate, endDate, organizationId, countForEachList } = req.query;

  const { status, message } = await getAnalysisUsageData({
    startDate,
    endDate,
    organizationId,
    countForEachList,
  });

  res.status(status).send(message);
};

exports.getMyOrganizationAnalysisUsage = async (req, res) => {
  let { startDate, endDate, countForEachList } = req.query;

  const { status, message } = await getAnalysisUsageData({
    startDate,
    endDate,
    organizationId: req.session.organization_id,
    countForEachList,
  });

  res.status(status).send(message);
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
  const orgAnalysisOptions = Object.values(analysisTypes).map((analysisType) => ({
    id: analysisType,
    selectedByDefault: selectedAnalysesByDefault.includes(analysisType),
  }));
  res.status(200).send(Object.values(orgAnalysisOptions));
};

const validateQueryParams = ({ startDate, endDate, countForEachList }) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return { error: 'Invalid date' };
  }

  if (!checkStartBeforeEnd(startDate, endDate)) {
    return { error: 'Start date must be before end date' };
  }

  if (countForEachList === 0 || countForEachList === 1) {
    countForEachList = parseInt(countForEachList ?? 0);
  }

  return {
    countForEachList,
  };
};
