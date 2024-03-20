const logger = require('../../../config/privateutils/logger.utils');

import { featureFlagsService } from '@wri-monorepos/sql';

module.exports = async function (request, response) {
  const { body: featureFlagData, session } = request;
  const { user_id: modifierUserId } = session;
  const { insertOrSaveFeatureFlag } = featureFlagsService();

  try {
    const updateDateTime = new Date();
    const upsertedFeatureFlag = await insertOrSaveFeatureFlag({
      ...featureFlagData,
      updateDateTime,
      modifierUserId,
    });

    response.status(200).send({
      success: true,
      data: upsertedFeatureFlag,
    });
  } catch (error) {
    logger.error(`POST /api/feature-flags`, error);
    response.status(500).send({
      success: false,
      error: 'An error occurred while processing the insertOrSaveFeatureFlag request.',
    });
  }
};
