const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');
const logger = require('../../../config/privateutils/logger.utils');

module.exports = async function (request, response) {
  const { body: featureFlagData } = request;
  const { insertOrSaveFeatureFlag } = createFeatureFlagsService(dataSource);

  try {
    const newFeatureFlag = await insertOrSaveFeatureFlag({
      ...featureFlagData,
      updateDateTime: new Date(),
    });

    response.status(200).send({
      success: true,
      newFeatureFlag,
    });
  } catch (error) {
    logger.error(`POST /api/feature-flags`, error);
    response.status(500).send({
      success: false,
      error: 'An error occurred while processing the insertOrSaveFeatureFlag request.',
    });
  }
};
