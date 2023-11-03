const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');
const logger = require('../../../config/privateutils/logger.utils');

module.exports = async function (request, response) {
  const { flagId } = request.params;
  const { getFeatureFlagsByFlagId } = createFeatureFlagsService(dataSource);

  try {
    const featureFlags = await getFeatureFlagsByFlagId(flagId);

    response.status(200).send({
      success: true,
      featureFlags,
    });
  } catch (error) {
    logger.error(`GET /api/feature-flags/${flagId}`, error);
    response.status(500).send({
      success: false,
      error: `An error occurred while processing the getFeatureFlagByFlagId request with flagId: [${flagId}].`,
    });
  }
};
