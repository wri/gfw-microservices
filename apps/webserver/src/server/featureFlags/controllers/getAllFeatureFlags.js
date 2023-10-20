const path = require('path');
const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');

module.exports = async function (request, response) {
  const featureFlagService = createFeatureFlagsService(dataSource);

  await dataSource.initialize();
  const featureFlagsCollection = await featureFlagService.getAllFeatureFlags();

  response.status(200).send({
    success: true,
    featureFlagsCollection,
  });
};
