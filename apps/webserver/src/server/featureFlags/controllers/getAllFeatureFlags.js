const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');

module.exports = async function (request, response) {
  const { organization_id } = request.session;
  console.log("🚀 ~ file: getAllFeatureFlags.js:5 ~ request.session:", request.session)
  const featureFlagService = createFeatureFlagsService(dataSource);

  await dataSource.initialize();
  const featureFlagsCollection = await featureFlagService.getAllFeatureFlags(organization_id);
  await dataSource.destroy();

  response.status(200).send({
    success: true,
    featureFlagsCollection,
  });
};
