const path = require('path');
const axios = require('axios');
const moment = require('moment');

const logger = require(path.resolve('./config/privateutils/logger.utils'));
const AWSSES = require(path.resolve('./config/privateutils/ses.utils'));

const {
  GEO_TRELLIS__ANALYZE_LIST_DEV,
  GEO_TRELLIS__ANALYZE_LIST_QA,
  GEO_TRELLIS__ANALYZE_LIST_STAGING,
  GEO_TRELLIS__ANALYZE_LIST_PROD,
  GEO_TRELLIS__ANALYZE_LIST_PRODV2,
} = require('../config/geoTrellis.config');

const { getOrganizationAnalysisUsage, getAccountLimits } = require(path.resolve(
  './server/analytics/service/analytics.service'
));
const { calculateProcessingLimit } = require(path.resolve('./config/privateutils/limits.utils'));
const { getOrganizationActivatedTime } = require(path.resolve(
  './config/publicutils/accountManager.utils'
));

/**
 * Submitting Analyze List request to step function for list to be processed by GeoTrellis
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Object} list - List info
 * @return {Promise} - request Promise
 */
exports.handleGeoTrellisAnalyzeListRequest = async (req, list) => {
  const { organization_user_id, organization_id, subscription_status_id } = req.session;
  const { reanalyze = false } = req.body;
  const { id: listID, list_name } = list;

  const geoTrellisUrlsByEnv = {
    qa: GEO_TRELLIS__ANALYZE_LIST_QA,
    staging: GEO_TRELLIS__ANALYZE_LIST_STAGING,
    production: GEO_TRELLIS__ANALYZE_LIST_PROD,
    ProdV2: GEO_TRELLIS__ANALYZE_LIST_PRODV2,
    default: GEO_TRELLIS__ANALYZE_LIST_DEV,
  };

  const url = geoTrellisUrlsByEnv[process.env.NODE_ENV] || geoTrellisUrlsByEnv.default;

  // get organization limits
  const accountLimits = await getAccountLimits(organization_id, subscription_status_id);

  // get organization usage
  const { OrganizationActivatedTime } = await getOrganizationActivatedTime(organization_id);
  const endDate = moment();
  const accountActivationDate = moment(OrganizationActivatedTime);
  const startDate = endDate.subtract(moment().diff(accountActivationDate, 'days') % 365, 'days');

  const [accountUsage] = await getOrganizationAnalysisUsage({
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
    organizationId: organization_id,
    countForEachList: 0,
  });

  // Calculate Processing limit either left for the year or max limit per list
  const processingLimit = calculateProcessingLimit(accountLimits, accountUsage);

  const data = {
    list_id: listID,
    user_id: organization_user_id,
    organization_id: parseInt(organization_id),
    reanalyze,
    processing_limit: processingLimit,
  };

  return await axios({
    method: 'post',
    url: url,
    data: data,
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(async (result) => {
      logger.logActivity(
        req,
        logger.listActivityTypes.List.ListAnalyzing,
        `ListAnalyzing ${list_name} has been sent to analysis`
      );

      // Send email to user that list is submitted to be analysed
      await AWSSES.sendEmail__ListSubmittedForAnalysis(req, list_name);

      return result;
    })
    .catch((error) => {
      logger.logActivity(
        req,
        logger.listActivityTypes.List.ListAnalyzing,
        `Error sending ${list_name} to analysis: ${error}`
      );

      return error.toJSON();
    });
};
