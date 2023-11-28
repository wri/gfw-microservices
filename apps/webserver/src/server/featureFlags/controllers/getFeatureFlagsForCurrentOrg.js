const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');
const logger = require('../../../config/privateutils/logger.utils');
const transformFlagsToAvailabilityObject = require('../utils/transformFlagsToAvailabilityObject');

module.exports = async function (request, response) {
  const { organization_id } = request.session;
  const { getFeatureFlagsForCurrentOrg } = createFeatureFlagsService(dataSource);

  try {
    const featureFlagsForCurrentOrg = await getFeatureFlagsForCurrentOrg(organization_id);
    const featureFlagsObjects = transformFlagsToAvailabilityObject(featureFlagsForCurrentOrg);

    response.status(200).send({
      success: true,
      data: featureFlagsObjects,
    });
  } catch (error) {
    logger.error('GET /api/feature-flags/myOrg', error);
    response.status(500).send({
      success: false,
      error: 'An error occurred while processing the getAllFeatureFlags request.',
    });
  }
};
