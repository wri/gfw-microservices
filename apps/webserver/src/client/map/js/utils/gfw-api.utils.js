import axios, { AxiosResponse } from 'axios';
import { DATA_API_URL } from '../../../common/js/config';
// ###########################################################################################
// API Documentation
// * https://data-api.globalforestwatch.org/
// * OLD - https://vizzuality.github.io/gfw-doc-api/#from-country-and-region
// ###########################################################################################
// We can adjust the size of the dots, color and scaling stops to our needs
// This follows mapbox styling spec: https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/
// ###########################################################################################

/**
 * Get BBox and Geostore IDs using SQL query
 * @param {String} GFW_LIST - GFW list ['gfw_oil_palm', 'rspo_oil_palm', 'wdpa_protected_areas', etc...]
 * @param {String} QUERY_FIELD - Query field ['gfw_geostore_id' || 'uml_id']
 * @param {String[]} IDs - Geostore/Palm Oil Mills IDs
 * @param {String} date - Date to query ['latest', 'v202010]
 * @return {Promise<AxiosResponse<any>>}
 */
export const getBBoxAndGeostoreIDs = async (GFW_LIST, QUERY_FIELD, IDs, date) => {
  const config = {
    method: 'POST',
    url: `${DATA_API_URL}/dataApi/getBBoxAndGeostoreIDs/`,
    params: {
      GFW_LIST: GFW_LIST,
      QUERY_FIELD: QUERY_FIELD,
      IDs: IDs.toString(),
      date: date,
    },
  };

  return axios(config)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error.toJSON();
    });
};

/**
 * Get Vector Tile Style
 * @param {String} GFW_LIST - GFW list ['gfw_oil_palm', 'rspo_oil_palm', 'wdpa_protected_areas']
 * @param {String} QUERY_FIELD - Query field ['gfw_geostore_id' || 'uml_id']
 * @param {String[]} IDs - Geostore/Palm Oil Mills IDs
 * @param {String} gfwVectorTileUrl - Active GFW Vector Tile
 * @param {Object} gfwVectorTileStyle - GFW Vector Tile Style
 * @return {Object} - GFW Vector Tile Style
 */
export const getVectorTileStyle = async (
  GFW_LIST,
  QUERY_FIELD,
  IDs,
  gfwVectorTileUrl,
  gfwVectorTileStyle
) => {
  const layers = gfwVectorTileStyle.layers.map((layer) => ({
    id: layer.id,
    source: GFW_LIST,
    'source-layer': GFW_LIST,
    type: layer.typeName,
    paint: layer.paint,
    filter: layer.filter
      ? [...layer.filter, ['in', QUERY_FIELD, ...IDs]]
      : ['all', ['in', QUERY_FIELD, ...IDs]],
  }));

  return {
    version: 8,
    sources: {
      [GFW_LIST]: {
        type: 'vector',
        url: gfwVectorTileUrl.replace('root.json', 'VectorTileServer'),
      },
    },
    layers: layers,
  };
};
