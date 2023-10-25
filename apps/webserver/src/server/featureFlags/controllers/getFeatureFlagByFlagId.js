const path = require('path');
const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');

module.exports = async function (request, response) {
  console.log("🚀 ~ file: getFeatureFlagByFlagId.js:5 ~ request:", request.params)
  const { flagId } = request.params;
  const featureFlagService = createFeatureFlagsService(dataSource);

  await dataSource.initialize();
  const featureFlag = await featureFlagService.getFeatureFlagById(flagId);
  await dataSource.destroy();

  response.status(200).send({
    success: true,
    featureFlag,
  });
};
