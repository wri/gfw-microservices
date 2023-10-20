const path = require('path');
const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');

module.exports = async function (request, response) {
  const { body: featureFlagData } = request;
  const featureFlagService = createFeatureFlagsService(dataSource);

  await dataSource.initialize();
  const newFeatureFlag = await featureFlagService.createFeatureFlag(featureFlagData);

  response.status(200).send({
    success: true,
    newFeatureFlag,
  });
};
