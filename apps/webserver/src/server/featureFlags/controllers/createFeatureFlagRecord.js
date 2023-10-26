const path = require('path');
const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');

module.exports = async function (request, response) {
  const { body: featureFlagData } = request;

  try {
    await dataSource.initialize();

    const featureFlagService = createFeatureFlagsService(dataSource);
    const newFeatureFlag = await featureFlagService.createFeatureFlag(featureFlagData);

    response.status(200).send({
      success: true,
      newFeatureFlag,
    });
  } catch (error) {
    console.error(error);
    response.status(500).send({
      success: false,
      error: 'An error occurred while processing the createFeatureFlag request.',
    });
  } finally {
    await dataSource.destroy();
  }
};
