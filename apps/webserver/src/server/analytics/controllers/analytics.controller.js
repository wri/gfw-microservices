const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));
const { getOrganizationAnalysisUsage } = require('../service/analytics.service');

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

exports.getOrganizationAnalysisUsage = async (req, res) => {
  let { startDate, endDate, orgId, listLevel } = req.query;

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    res.status(400).send({ error: 'Invalid date' });
  }

  if (!checkStartBeforeEnd(startDate, endDate)) {
    res.status(400).send({ error: 'Start date must be before end date' });
  }

  if (listLevel === 0 || listLevel === 1) {
    listLevel = parseInt(listLevel ?? 0);
  }

  const result = await getOrganizationAnalysisUsage({
    startDate,
    endDate,
    orgId,
    listLevel,
  });

  res.status(200).send(result);
};
