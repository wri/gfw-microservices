import axios from 'axios';

/**
 * @description - Get list Mbtile info
 *
 * @param {number} listID - List ID (e.g. 1385)
 * @return {Promise<void>}
 */
export async function getListMbtileInfo(listID, retries = 3, retryDelay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data } = await axios({
        url: '/vectorTile/getListMbtileInfo',
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        data: { listID },
      });
      return data;
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err);
      if (attempt === retries) {
        throw err; // last attempt, rethrow error
      }
      // wait before retrying
      await new Promise((res) => setTimeout(res, retryDelay));
    }
  }
}

/**
 * @description - Get List Location Geometry
 *
 * @param {string} listTableName - List table name (e.g. 'list-doesthisprocess2')
 * @param {number} locationID - Location ID (e.g. 16)
 * @return {Promise<void>}
 */
export async function getListLocationGeometry(listTableName, locationID) {
  const { data } = await axios({
    url: '/locations/getListLocationGeometry',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    data: {
      listTableName,
      locationID,
    },
  }).catch((err) => {
    console.error(err);
  });

  return data;
}
