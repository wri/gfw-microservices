/**
 * Cache for information about each layer, to be shown in the modal
 */
import { DATA_API_URL } from '../../../common/js/config';

const _cache = {};

/**
 * Fetch the metadata from GFW's Metadata API
 * @param {string} url - api url plus technical name, e.g. urls.metadataApi + '/tree_cover_loss'
 * @return promise
 */
function getMetadataTask(url) {
  return new Promise((resolve) => {
    const metadataUrlPartsList = url.split('/');
    const metadataID = metadataUrlPartsList[metadataUrlPartsList.length - 1];

    const request = new XMLHttpRequest();

    request.addEventListener('load', () => {
      const { data } = JSON.parse(request.response);
      resolve(data);
    });

    request.onerror = () => {
      resolve(false);
    };

    request.open('POST', `${DATA_API_URL}/dataApi/getMetadataTaskData/${metadataID}`);
    request.send();
  });
}

/**
 * Reduce the xml document to the desired JSON format
 * @param {document} xmlDoc - xml document to parse
 * @return {object} result
 * @return {string} result.title
 * @return {string} result.subtitle
 * @return {string} result.cautions
 * @return {string} result.overview
 * @return {string} result.citation
 * @return {string} result.source
 * @return {string} result.other
 * @return {string} result.function
 * @return {string} result.download_data
 * @return {string} result.tags
 * @return {string} result.learn_more
 * @return {string} result.frequency_of_updates
 * @return {string} result.geographic_coverage
 * @return {string} result.license
 * @return {string} result.date_of_content
 * @return {string} result.resolution
 */

export default {
  get(layerId) {
    return _cache[layerId];
  },

  fetch(layer) {
    return new Promise((resolve) => {
      if (layer.metadataId) {
        getMetadataTask(layer.metadataId).then((results) => {
          _cache[layer.metadataId] = results;
          resolve(results);
        });
      } else {
        resolve();
      }
    });
  },
};
