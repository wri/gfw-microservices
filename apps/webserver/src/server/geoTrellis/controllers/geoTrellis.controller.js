const logger = require('../../../config/privateutils/logger.utils');
const ListManager = require('../../../config/publicutils/listManager.utils');
const { handleGeoTrellisAnalyzeListRequest } = require('../utils/geoTrellis.utils');
const { GEO_TRELLIS_ANALYZE_LIST } = require('../../../config/config/locations.config');
const { listStatus } = require('../../../config/env/listStatuses.constants');
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
  const { list } = req.body;
  const { id: listID } = list;

  try {
    // Set list status ID to be Pending
    await ListManager.setListStatus(req, listID, listStatus.Pending);

    // Send request to GeoTrellis step function
    const { data } = await handleGeoTrellisAnalyzeListRequest(req, list);

    res.json({
      message: data,
      success: true,
    });
  } catch (e) {
    req.list = list;

    if (e.message === 'Analysis limit reached') {
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

    res.json({
      message: e,
      success: false,
    });
  }
};
