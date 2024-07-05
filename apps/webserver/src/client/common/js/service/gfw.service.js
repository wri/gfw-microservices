import { proLayers } from '../proLayers.config';
import { mapLayers } from './mapLayers.constants';

export function fetchGfwProLayers() {
  const layersData = [];

  Object.values(proLayers).forEach((layerName) => {
    const layerConfiguration = mapLayers.find((mapLayer) => mapLayer.attributes.name === layerName);
    if (layerConfiguration) {
      layersData.push(layerConfiguration);
    }
  });

  return layersData;
}
