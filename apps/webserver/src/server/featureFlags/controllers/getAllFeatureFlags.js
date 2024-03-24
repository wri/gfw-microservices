const logger = require('../../../config/privateutils/logger.utils');
import { featureFlagsService } from '@wri-monorepos/shared';

// Get all flags for SuperAdmin (no org)
module.exports = async function (request, response) {
  console.table(featureFlagsService());
  const { getAllFeatureFlags } = await featureFlagsService();

  try {
    const featureFlags = await getAllFeatureFlags();

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
