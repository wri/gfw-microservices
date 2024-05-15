const logger = require('../../../config/privateutils/logger.utils');
import fetch from 'node-fetch';

const { LISTS_MICROSERVICE_URL } = process.env;
const BASE_URL = `${LISTS_MICROSERVICE_URL ?? 'http://localhost:3333/api'}/fcd`;

const getListProcessingUrl = ({ listId, category }) => {
  return `${BASE_URL}/${listId}/${category}`;
};

/**
 * @summary issues request to list-processing api, handles errors
 *
 * @param {object} params
 * param {String} clientDatabase
 * param {Number} listId
 * param {String} category
 * param {String} country
 * param {String} countryGadm
 * param {Number} locationId
 * @returns {Promise<Object>} result
 */
export default async ({
  clientDatabase,
  listId,
  category,
  country,
  countryGadm,
  locationId = '',
}) => {
  try {
    const url = getListProcessingUrl({ listId, category });

    const response = await fetch(url, {
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

    if (!response.ok) {
      throw new Error(
        `Error POST ${url} failed with status ${response.status}: '${response.statusText}'`
      );
    }

    const data = await response.json();

    return {
      error: false,
      category,
      ...data,
    };
  } catch (error) {
    logger.info(`ListProcessingRequest ${error.name}: ${error.message}`);
    throw new Error(`ListProcessingRequestError ${error.message}`);
  }
};
