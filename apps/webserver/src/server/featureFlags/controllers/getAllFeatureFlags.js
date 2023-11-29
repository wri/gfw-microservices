const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');
const logger = require('../../../config/privateutils/logger.utils');

module.exports = async function (request, response) {
  const { organization_id } = request.session; // undefined for proManagers
  const { getAllFeatureFlags } = createFeatureFlagsService(dataSource);

  try {
    const featureFlags = await getAllFeatureFlags(organization_id);

    response.status(200).send({
      success: true,
      data: featureFlags,
    });
  } catch (error) {
    logger.error('GET /api/feature-flags', error);
    response.status(500).send({
      success: false,
      error: 'An error occurred while processing the getAllFeatureFlags request.',
    });
  }
};
