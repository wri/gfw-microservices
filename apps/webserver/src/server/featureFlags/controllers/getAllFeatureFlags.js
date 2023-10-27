const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');

module.exports = async function (request, response) {
  const { organization_id } = request.session;
  const { getAllFeatureFlags } = createFeatureFlagsService(dataSource);

  try {
    const featureFlagsCollection = await getAllFeatureFlags(organization_id);
    response.status(200).send({
      success: true,
      featureFlagsCollection,
    });
  } catch (error) {
    console.error(error);
    response.status(500).send({
      success: false,
      error: 'An error occurred while processing the getAllFeatureFlags request.',
    });
  }
};
