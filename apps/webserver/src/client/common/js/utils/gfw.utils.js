import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import { fetchGfwProLayers } from '../service/gfw.service';
import {
  GFW_LISTS_NAMES_TO_MAP_LAYER_IDS,
  MAP_LAYER_IDS_TO_GFW_LISTS_NAMES,
} from '../constants/lists.constants';

export const getMapLayerIdFromGFWListName = (gfwListName) => {
  return GFW_LISTS_NAMES_TO_MAP_LAYER_IDS?.[gfwListName];
};
export const getGFWListNameFromMapLayerId = (mapLayerId) => {
  if (mapLayerId === 'administrative-areas' || mapLayerId === 'admin-areas') {
    return 'Administrative Areas';
  }

  return MAP_LAYER_IDS_TO_GFW_LISTS_NAMES?.[mapLayerId];
};

/**
 * @description - Get the layer name from the list name
 * @param {string} layerID - Layer id
 * @return {string} - Layer name
 */

/**
 * @description - Get the Vector Tile layer from the list name
 * @param {Object} esriMap - Esri map
 * @param {string} listName - List name
 */
export async function handleGfwProListVectorTileLayer(esriMap, listName) {
  const layersData = await fetchGfwProLayers();
  const mapLayer = getMapLayerIdFromGFWListName(listName);
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
