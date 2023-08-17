import VectorTileLayer from 'esri/layers/VectorTileLayer';

// Services
import { fetchGfwProLayers } from '../service/gfw.service';
import { getGfwProMapLayerName } from './gfw.utils';

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
