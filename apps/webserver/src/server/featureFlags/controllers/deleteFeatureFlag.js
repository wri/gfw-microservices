const logger = require('../../../config/privateutils/logger.utils');
import { featureFlagsService } from '@wri-monorepos/shared';

module.exports = async function (request, response) {
  const { flagId } = request.params;
  const { orgId } = request.body;
  const { deleteFeatureFlag } = featureFlagsService();

  try {
    const deletedFeatureFlag = await deleteFeatureFlag({
      flagId,
      orgId,
    });

    response.status(200).send({
      success: true,
      data: deletedFeatureFlag,
    });
  } catch (error) {
    logger.error(`POST /api/feature-flags/${flagId}/delete`, error);
    response.status(500).send({
      success: false,
      error: 'An error occurred while processing the deleteFeatureFlag request.',
    });
  }
};
