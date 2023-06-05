import VectorTileLayer from 'esri/layers/VectorTileLayer';

// Services
import { fetchGfwProLayers } from '../service/gfw.service';

// Configs
import { proLayers } from '../config';
import { gfwListNames, GFW_LIST_NAME } from '../constants/lists.constants';

/**
 * @description - Check if the list is a GFW list
 * @param {string} listName - List name
 * @return {boolean} - True if the list is a GFW list
 */
export function isGfwList(listName) {
  return gfwListNames.includes(listName);
}

/**
 * @description - returns gfwLayerId if the list is a GFW list
 * @param {string} gfwListName - List name
 * @return {false || string} - string if the list is a GFW list
 */

export const flipGFWListNames = (obj) => {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key]));
};

const GFW_LISTS = flipGFWListNames(GFW_LIST_NAME);

export const discernGfwID = (gfwListName) => {
  const layerName = GFW_LISTS[gfwListName];
  return layerName ? proLayers[layerName] : false;
};

/**
 * @description - Check if the list is a user list
 * @param {object} selectedList - List object
 * @return {boolean} - True if the list is a user list
 */
export const isUserList = (selectedList) =>
  Object.prototype.hasOwnProperty.call(selectedList, 'user_id');

/**
 * @description - Get the layer name from the list name
 * @param {string} layerID - Layer id
 * @return {string} - Layer name
 */
export function getGfwProMapLayerName(layerID) {
  if (layerID === 'Administrative Areas') {
    return;
  }

  return discernGfwID(layerID);
}

/**
 * @description - Get the Vector Tile layer from the list name
 * @param {Object} esriMap - Esri map
 * @param {string} listName - List name
 */
export async function handleGfwProListVectorTileLayer(esriMap, listName) {
  const layersData = await fetchGfwProLayers();
  const mapLayer = getGfwProMapLayerName(listName);
  const gfwLayer = layersData.find((layer) => {
    return layer.attributes.name === mapLayer;
  });

  const gfwProVectorTileStyleURL = gfwLayer.attributes.layerConfig.body.url;
  const gfwProVectorTileLayer = new VectorTileLayer({
    id: 'GFW_PRO_VECTOR_TILE_LAYER',
    url: gfwProVectorTileStyleURL,
  });

  esriMap.add(gfwProVectorTileLayer);
}
