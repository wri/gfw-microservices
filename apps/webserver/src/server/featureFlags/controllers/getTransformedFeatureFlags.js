import { featureFlagsService } from '@wri-monorepos/shared';
const transformFlagsToAvailabilityObject = require('../utils/transformFlagsToAvailabilityObject');
const logger = require('../../../config/privateutils/logger.utils');

// Get all flags for current org and transform them to availability properties
// suitable for the frontend
module.exports = async function (request, response) {
  const { organization_id } = request.session;
  const { getAllFeatureFlags } = await featureFlagsService();

  try {
    const featureFlags = await getAllFeatureFlags(organization_id);
    const transformedFlags = transformFlagsToAvailabilityObject(featureFlags);

    response.status(200).send({
      success: true,
      data: transformedFlags,
    });
  } catch (error) {
    logger.error('GET /api/feature-flags', error);
    response.status(500).send({
      success: false,
      error: 'An error occurred while processing the getAllFeatureFlags request.',
    });
  }
};
