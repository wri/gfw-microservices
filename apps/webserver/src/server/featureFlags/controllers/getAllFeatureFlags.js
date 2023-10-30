const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');

module.exports = async function (request, response) {
  const { organization_id } = request.session;
  const { getFeatureFlagsForCurrentOrg } = createFeatureFlagsService(dataSource);

  try {
    const featureFlagsForCurrentOrg = await getFeatureFlagsForCurrentOrg(organization_id);

    response.status(200).send({
      success: true,
      featureFlagsForCurrentOrg,
    });
  } catch (error) {
    console.error(error);
    response.status(500).send({
      success: false,
      error: 'An error occurred while processing the getAllFeatureFlags request.',
    });
  }
};
