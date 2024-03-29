const path = require('path');
const logger = require(path.resolve('./config/privateutils/logger.utils'));
const makeListProcessingRequest = require('../utils/makeListProcessingRequest');
const FcdParamsSchema = require('../utils/fcdValidationSchema');

/**
 * @summary manage requests for list-processing api
 * @param {Object} req Express Request
 * @param {Object} res Express Respond
 */
module.exports = async (req, res) => {
  try {
    const { organization_database: clientDatabase } = req.session;

    // validate params and throw error if something's missing
    const zodValidationResult = FcdParamsSchema.parse(req.query);

    // note: category is transformed by zod from string => string[]
    const { listId, category: categories, country, countryGadm, locationId } = zodValidationResult;

    const requestData = await Promise.all(
      categories.map(async (category) => {
        try {
          return await makeListProcessingRequest({
            clientDatabase,
            listId,
            category,
            country,
            countryGadm,
            locationId,
          });
        } catch (error) {
          return {
            error: true,
            category,
            message: error.message,
          };
        }
      })
    );

    // prepare data for client
    const responseData = requestData.reduce((acc, item) => {
      const { category, ...rest } = item;
      acc[category] = {
        ...rest,
      };
      return acc;
    }, {});

    // prepare status for client
    const isEveryRequestSuccessful = requestData.every((item) => item.status === 200);
    const statusCode = isEveryRequestSuccessful ? 200 : 207;

    res.status(statusCode).send(responseData);
  } catch (error) {
    logger.info('Error POST /api/fcd failed on webserver', error);
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};
