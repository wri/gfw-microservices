import axios from 'axios';
import errorLogger from '../../../common/js/utils/errorLogger';

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
        errorLogger.error('GFW API error response', {
          component: 'gfw-api.utils',
          action: 'getPalmOilMillLatLong',
          error: err.response,
          palmOilMillID: PalmOilMillID,
        });
      } else if (err.request) {
        // client never received a response, or request never left
        errorLogger.error('GFW API request failed', {
          component: 'gfw-api.utils',
          action: 'getPalmOilMillLatLong',
          error: err.request,
          palmOilMillID: PalmOilMillID,
        });
      } else {
        // anything else
        errorLogger.error('GFW API unknown error', {
          component: 'gfw-api.utils',
          action: 'getPalmOilMillLatLong',
          error: err.toJSON(),
          palmOilMillID: PalmOilMillID,
        });
      }

      return err;
    });
};
