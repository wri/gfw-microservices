const path = require('path');
const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');

module.exports = async function (request, response) {
  const { flagId } = request.param;
  const featureFlagService = createFeatureFlagsService(dataSource);

  await dataSource.initialize();
  const featureFlag = await featureFlagService.getFeatureFlagById(flagId);

  response.status(200).send({
    success: true,
    featureFlag,
  });
};
