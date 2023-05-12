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
const { handleGeoTrellisAnalyzeListRequest } = require('../../server/geoTrellis/utils/geoTrellis.utils');

const analyzeLocation = (req, organization_database, list, geojson) => {
  const { organization_user_id, organization_id, user_first_name, user_last_name, user_email } = req.session;
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
 * @param {Boolean} isEdit - A boolean used to determine if we are running a list edit (either a move or copy location)
 */
const analyzeList = async (req, organization_database, list) => {
  const { user_email } = req.session;
  const { list_id, dest_list_id, list_status_id } = req.body;
  const { id: listID, list_name } = list;

  const id = listID || dest_list_id || list_id;

  try {
    if (list_status_id === config.platformVars.status.Pending) {
      // Send list to be analysed
      await handleGeoTrellisAnalyzeListRequest(req, { id, list_name });
    }
  } catch (err) {
    logger.logActivity(
      req,
      logger.listActivityTypes.List.ListAnalyzing,
      `Error sending (${list_name}) to be analysed. Error: ${err}`
    );

    const subject = 'Error Submitting for Analysis';
    const msg = AWSSES.createBodyContent(req, config.platformVars.emailType.LIST_ANALYSIS_ERROR, {}, 'error');
    return AWSSES.sendEmail(req, config.AWSVars.ses.sender, [user_email], subject, msg);
  }
};

/**
 * @function rerunList
 * @summary Sends
 * @param  {Object}     req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param  {String}     organization_database - The organization DB
 * @param  {Object}     list - Object containg all info about a list (schema)
 */
const rerunList = (req, organization_database, list) => {
  const { organization_user_id, user_first_name, user_last_name, user_email } = req.session;
  // 1. Log the action
  logger.logActivity(
    req,
    logger.listActivityTypes.List.ListAnalyzing,
    `Rerun process has started for ${list.list_name}`
  );
  // 2. Send SQS message for analysis (for location_id and queue_url, using the defaults.)
  sqsUtils
    .sendMessage(
      organization_user_id,
      user_first_name,
      user_last_name,
      user_email,
      organization_database,
      list.list_name,
      list.list_table,
      list.analysis_table
    )
    .then(() => {
      const content = { list_name: list.list_name };
      const subject = `Diagnostics and List Views rerun process for the GFW Pro list ${list.list_name} has started`;
      const msg = AWSSES.createBodyContent(req, config.platformVars.emailType.LIST_ANALYSIS_RERUN_SUCCESS, content);
      logger.logActivity(req, logger.listActivityTypes.List.ListAnalyzing, `(${list.list_name}) sent to queue.`);
      return AWSSES.sendEmail(req, config.AWSVars.ses.sender, [user_email], subject, msg);
    })
    .catch((err) => {
      console.log('Error sending rerun list to queue', err);
      const subject = 'Error Submitting Analysis for rerun';
      const msg = AWSSES.createBodyContent(req, config.platformVars.emailType.LIST_ANALYSIS_ERROR, 'error');
      // logger.logActivity(req, logger.listActivityTypes.List.ListAnalyzing, `Error sending ${list.list_name} to queue`);
      errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.SQSError,
        `Failed to send list ${list.list_name} to queue for rerun`,
        err
      );
      return AWSSES.sendEmail(req, config.AWSVars.ses.sender, [user_email], subject, msg);
    });
};

module.exports = {
  analyzeLocation,
  analyzeList,
  rerunList,
};
