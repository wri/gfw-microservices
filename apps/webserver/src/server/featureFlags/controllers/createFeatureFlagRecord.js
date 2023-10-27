const { dataSource, createFeatureFlagsService } = require('../service/createFeatureFlagsService');

module.exports = async function (request, response) {
  const { body: featureFlagData } = request;
  const { createFeatureFlag } = createFeatureFlagsService(dataSource);

  try {
    const newFeatureFlag = await createFeatureFlag({
      ...featureFlagData,
      updateDateTime: new Date(),
    });

    response.status(200).send({
      success: true,
      newFeatureFlag,
    });
  } catch (error) {
    console.error(error);
    response.status(500).send({
      success: false,
      error: 'An error occurred while processing the createFeatureFlag request.',
    });
  }
};
