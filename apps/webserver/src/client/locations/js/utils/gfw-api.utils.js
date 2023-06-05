import axios from 'axios';

/**
 * Get Palm Oil Mill latitude and longitude
 * @param {String} PalmOilMillID - Palm Oil Mill ID ('PO1000004269', etc...)
 * @return {Promise<T>} - GFW Data API result
 */
export const getPalmOilMillLatLong = async (PalmOilMillID) => {
  return await axios({
    method: 'get',
    url: 'https://data-api.globalforestwatch.org/dataset/gfw_universal_mill_list/latest/query',
    params: {
      sql: `select latitude, longitude from data where uml_id in ('${PalmOilMillID}')`,
    },
  })
    .then((res) => res)
    .catch((err) => {
      if (err.response) {
        // client received an error response (5xx, 4xx)
        console.log(err.response);
      } else if (err.request) {
        // client never received a response, or request never left
        console.log(err.request);
      } else {
        // anything else
        console.log(err.toJSON());
      }

      return err;
    });
};
