/* eslint-disable consistent-return */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable camelcase */
/** ******************************************************************
 *  @name : analysis.utils.js
 *  @description : A utility file for analysis
 *
 *  @function {analyzeLocation}
 *  @function {analyzeList}
 *
 ******************************************************************* */
const path = require('path');
const config = require('../config');

const AWSSES = require(path.resolve('./config/privateutils/ses.utils'));
const sqsUtils = require(path.resolve('./config/privateutils/sqs.utils'));
const logger = require(path.resolve('./config/privateutils/logger.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const {
  handleGeoTrellisAnalyzeListRequest,
} = require('../../server/geoTrellis/utils/geoTrellis.utils');
const { listStatus } = require(path.resolve('./config/env/listStatuses.constants'));

const analyzeLocation = (req, organization_database, list, geojson) => {
  const { organization_user_id, organization_id, user_first_name, user_last_name, user_email } =
    req.session;
  const { appendLocations } = req.body;

  // Log the action
  logger.logActivity(
    req,
    logger.listActivityTypes.List.ListAnalyzing,
    `Calculation process has started for (${geojson.features.length}) locations in (${list.list_name})`
  );
  // Loop through each feature(location) in geojson and send SQS message to be pulled for analysis
  const entries = geojson.features.map((feature) => {
    const { location_id } = feature.properties;
    return {
      AnalysisTable: list.analysis_table,
      Analyses: [],
      Database: organization_database,
      Environment: process.env.NODE_ENV,
      ListName: list.list_name,
      ListTable: list.list_table,
      LocationId: location_id,
      Retries: 0,
      UserEmail: user_email,
      FirstName: user_first_name,
      LastName: user_last_name,
      UserId: organization_user_id,
      OrganizationId: organization_id,
      AppendLocations: appendLocations ? 1 : 0,
    };
  });
  sqsUtils
    .sendMessageBatch(entries, config.AWSVars.sqs.location_queue_url)
    .then(() => {
      console.log('Sent locations to queue.');
    })
    .catch((err) => {
      console.log('Error sending location to queue', err);
      errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.SQSError,
        `Failed to sending locations in ${list.list_name} to queue`,
        err
      );
    });
};

/**
 * @function analyzeList
 * @summary Sends list level messages to the AWS SQS queue
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {String} organization_database - The organization DB
 * @param {Object} list - Object containg all info about a list (schema)
 */
const analyzeList = async (req, organization_database, list) => {
  const { user_email } = req.session;
  const { list_id, dest_list_id, list_status_id } = req.body;
  const { id: listID, list_name } = list;

  const id = listID || dest_list_id || list_id;

  try {
    if (list_status_id === listStatus.Pending) {
      // Send list to be analysed
      await handleGeoTrellisAnalyzeListRequest(req, { id, list_name });
    }
  } catch (err) {
    logger.logActivity(
      req,
      logger.listActivityTypes.List.ListAnalyzing,
      `Error sending (${list_name}) to be analysed. Error: ${err}`
    );

    let subject = 'Error Submitting for Analysis';
    let emailTemplate = config.platformVars.emailType.LIST_ANALYSIS_ERROR;
    let level = 'error';
    if (err.message === `Analysis limit reached`) {
      subject = `Analysis limit reached`;
      emailTemplate = config.platformVars.emailType.ANALYSIS_LIMIT_REACHED;
      level = 'limit';
    }

    const msg = AWSSES.createBodyContent(
      req,
      emailTemplate,
      {
        list_name,
      },
      level
    );
    return AWSSES.sendEmail(req, config.AWSVars.ses.sender, [user_email], subject, msg);
  }
};

module.exports = {
  analyzeLocation,
  analyzeList,
};
