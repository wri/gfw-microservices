const path = require('path');
const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');

module.exports = async function (request, response) {
  const { flagId } = request.params;

  try {
    await dataSource.initialize();

    const featureFlagService = createFeatureFlagsService(dataSource);
    const featureFlag = await featureFlagService.getFeatureFlagById(flagId);

    response.status(200).send({
      success: true,
      featureFlag,
    });
  } catch (error) {
    console.error(error);
    response.status(500).send({
      success: false,
      error: 'An error occurred while processing the getFeatureFlagById request.',
    });
  } finally {
    await dataSource.destroy();
  }
};
