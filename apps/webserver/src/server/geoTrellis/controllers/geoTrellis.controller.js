const logger = require('../../../config/privateutils/logger.utils');
const { handleGeoTrellisAnalyzeListRequest } = require('../utils/geoTrellis.utils');
const { GEO_TRELLIS_ANALYZE_LIST } = require('../../../config/config/locations.config');
const AWSSES = require('../../../config/privateutils/ses.utils');
import config from '../../../config/config';

/**
 * Handling GeoTrellis Submit Edits request
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
export const geoTrellisAnalyzeListController = async (req, res) => {
  logger.info(`POST ${GEO_TRELLIS_ANALYZE_LIST.route}`);
  const { list, analysisTypes = '' } = req.body;

  try {
    if (!analysisTypes) {
      throw new Error(`Something went wrong. Missing analysisTypes`);
    }
    // TODO: find call sites in this path, do we need to re-add it for [Analyses] table
    // GPV-5001
    // Set list status ID to be Pending
    // await ListManager.setListStatus(req, listID, listStatus.Pending);

    // Send request to GeoTrellis step function
    const data = await handleGeoTrellisAnalyzeListRequest(req, list, analysisTypes);

    res.status(200).send({
      message: data,
      success: true,
    });
  } catch (error) {
    logger.error(`Post ${GEO_TRELLIS_ANALYZE_LIST.route}`, error);
    req.list = list;

    if (error.message === 'Analysis limit reached') {
      await AWSSES.sendErrorNotificationEmail(
        req,
        config.platformVars.emailType.ANALYSIS_LIMIT_REACHED
      );
    } else {
      await AWSSES.sendErrorNotificationEmail(
        req,
        config.platformVars.emailType.LIST_ANALYSIS_ERROR
      );
    }

    res.status(500).send({
      message: error,
      success: false,
    });
  }
};
