import axios from 'axios';

/**
 * @description - Get list Mbtile info
 *
 * @param {number} listID - List ID (e.g. 1385)
 * @return {Promise<void>}
 */
export async function getListMbtileInfo(listID) {
  const { data } = await axios({
    url: '/vectorTile/getListMbtileInfo',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    data: {
      listID,
    },
  }).catch((err) => {
    console.error(err);
  });

  return data;
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
