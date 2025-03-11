const GEOSTORE_API = 'https://production-api.globalforestwatch.org/v1/geostore';

/**
 * Registers geometry with the GFW API, return payload contains geostore ID
 *
 * @param {Object<geojson>} geojsonPayload - Is geojson object from selected feature or draw polygon
 * @return {Object} geoStore - GFW registered GEO Store response object containing {attributes: Object, id: string, type: string}
 */
export async function registerGeometry(geojsonPayload) {
  //Geostore API endpoint sometimes fails to register geometry, we are trying up to 3 times and then failing out
  function fetchRetry(url, options = {}, retries = 3) {
    return fetch(url, options)
      .then((res) => {
        if (res.ok) {
          return res;
        }
        if (retries > 0) {
          return fetchRetry(url, options, retries - 1);
        } else {
          throw new Error('error in fetching geostore results');
        }
      })
      .catch((e) => console.error(e));
  }

  const content = JSON.stringify({ geojson: geojsonPayload });

  const options = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: content,
  };

  const res = fetchRetry(GEOSTORE_API, options, 3);
  return res;
}

/**
 * fetchGeostoreInfo. Given geostore ID, fetches geojson from GFW Api
 *
 * @param {string} geostoreID
 */
export async function fetchGeostoreInfo(geostoreID) {
  fetch(`${GEOSTORE_API}${geostoreID}`)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((e) => console.error(e));
}
