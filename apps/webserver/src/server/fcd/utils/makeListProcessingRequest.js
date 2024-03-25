const path = require('path');
const logger = require(path.resolve('./config/privateutils/logger.utils'));
const fetch = require('node-fetch');

const { LISTS_MICROSERVICE_URL } = process.env;
const BASE_URL = `${LISTS_MICROSERVICE_URL ?? 'http://localhost:3333/api'}/fcd`;

const getListProcessingUrl = ({ listId, category }) => {
  return `${BASE_URL}/${listId}/${category}`;
};

/**
 * @summary issues request to list-processing api, handles errors
 *
 * @param {String} clientDatabase
 * @param {Number} listId
 * @param {String} category
 * @param {String} country
 * @param {String} countryGadm
 * @param {Number} locationId
 * @returns {Object} result
 */
module.exports = async ({
  clientDatabase,
  listId,
  category,
  country,
  countryGadm,
  locationId = '',
}) => {
  try {
    const url = getListProcessingUrl({ listId, category });

    const request = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientDatabase,
        country,
        countryGadm,
        locationId,
      }),
    });

    if (!request.ok) {
      throw new Error(
        `Error POST ${url} failed with status ${request.status}: '${request.statusText}'`
      );
    }

    const data = await request.json();

    // debugging
    // console.log('request: ——[•]>', request);
    // console.log("data: ——[•]>", data);

    return {
      error: false,
      category,
      data,
    };
  } catch (error) {
    logger.info(`ListProcessingRequest ${error.name}: ${error.message}`);
    throw new Error(`ListProcessingRequestError ${error.message}`);
  }
};
