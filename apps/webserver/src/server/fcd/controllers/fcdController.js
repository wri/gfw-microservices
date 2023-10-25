const axios = require('axios');
const { forEach } = require('lodash');
const CATEGORIES = ['wdpa', 'landmark'];

const { LISTS_MICROSERVICE_URL } = process.env;
const BASE_URL = `${LISTS_MICROSERVICE_URL}/fcd`;

const addData = async (response, { listId, category, country, organizationDatabase }) => {
  let url = `${BASE_URL}/${listId}}`;

  if (!category.toLowerCase().includes('wdpa')) {
    url = `${url}/wdpa_overlap_country`;
  } else if (!category.toLowerCase().includes('landmark')) {
    url = `${url}/landmark_overlap_country`;
  }

  url = `${url}/${country}?clientDatabase=${organizationDatabase}`;
  try {
    const result = await axios.get(url);

    const { data } = result;

    response[category] = {
      ...data,
    };
  } catch (error) {
    response[category] = {
      error: true,
      message: [error.message],
    };
  }
};

module.exports = async (request, response) => {
  const { listId, category, country } = request.query;
  const { organization_database: organizationDatabase } = request.session;

  const message = [];

  if (!listId) {
    message.append('Missing listId');
  }

  if (!category || !CATEGORIES.join(',').includes(category.toLowerCase())) {
    message.append('Missing category');
  }

  if (!country) {
    message.append('Missing country');
  }

  if (message.length > 0) {
    return response.status(400).send({
      error: true,
    });
  }

  try {
    const result = {
      error: false,
    };

    const categorySplitted = category.split(',');

    for (let i = 0; i < categorySplitted.length; i++) {
      await addData(result, {
        listId,
        category: categorySplitted[i],
        country,
        organizationDatabase,
      });
    }

    return response.status(200).send(result);
  } catch (error) {
    return response.status(400).send({
      message: [error.message],
      error: true,
    });
  }
};
