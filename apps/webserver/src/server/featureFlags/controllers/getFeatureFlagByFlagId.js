const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');

module.exports = async function (request, response) {
  const { flagId } = request.params;
  const { getFeatureFlagsByFlagId } = createFeatureFlagsService(dataSource);

  try {
    const featureFlags = await getFeatureFlagsByFlagId(flagId);

    response.status(200).send({
      success: true,
      featureFlags,
    });
  } catch (error) {
    console.error(error);
    response.status(500).send({
      success: false,
      error: `An error occurred while processing the getFeatureFlagByFlagId request with flagId: [${flagId}].`,
    });
  }
};
