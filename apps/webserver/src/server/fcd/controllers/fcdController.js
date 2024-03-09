const axios = require('axios');
const CATEGORIES = ['wdpa', 'landmark', 'country'];

const { LISTS_MICROSERVICE_URL } = process.env;
const BASE_URL = `${LISTS_MICROSERVICE_URL ?? 'http://localhost:3333/api'}/fcd`;

const categoryUrls = {
  wdpa: 'wdpa_overlap_country',
  landmark: 'landmark_overlap_country',
  country: 'country_specific_deforestation',
};

const addData = async (
  response,
  { listId, category, country, organizationDatabase, countryGadm, locationId }
) => {
  let url = `${BASE_URL}/${listId}/${categoryUrls[category.toLowerCase()]}/${country}`;

  const params = {
    clientDatabase: organizationDatabase,
    countryGadm,
    locationId,
  };

  try {
    const result = await axios.get(url, { params });

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

const getData = async ({
  listId,
  category,
  country,
  organizationDatabase,
  countryGadm,
  locationId,
}) => {
  const message = [];

  if (!listId) {
    message.push('Missing listId');
  }

  if (!category || !CATEGORIES.join(',').includes(category.toLowerCase())) {
    message.push('Missing category');
  }

  if (!country) {
    message.push('Missing country');
  }

  if (message.length > 0) {
    return [
      400,
      {
        message,
        error: true,
      },
    ];
  }

  try {
    const result = {
      error: false,
    };

    const categorySplitted = category.split(',');

    for (let i = 0; i < categorySplitted.length; i++) {
      const category = categorySplitted[i];
      if (category === 'country') {
        if (!countryGadm) {
          return [
            400,
            {
              message: 'Missing country Gadm',
              error: true,
            },
          ];
        }
        if (!locationId) {
          return [
            400,
            {
              message: 'Missing locationId',
              error: true,
            },
          ];
        }
      }
      await addData(result, {
        listId,
        category,
        country,
        organizationDatabase,
        countryGadm,
        locationId,
      });
    }

    return [200, result];
  } catch (error) {
    return [
      400,
      {
        message: [error.message],
        error: true,
      },
    ];
  }
};

const run = async (request, response) => {
  const { listId, category, country, countryGadm, locationId } = request.query;
  const { organization_database: organizationDatabase } = request.session;
  const [statusCode, result] = await getData({
    listId,
    category,
    country,
    organizationDatabase,
    countryGadm,
    locationId,
  });
  response.status(statusCode).send(result);
};

module.exports = {
  run,
  getData,
};
