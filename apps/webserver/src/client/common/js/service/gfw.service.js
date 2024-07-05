import { proLayers } from '../proLayers.config';
import { mapLayers } from './mapLayers.constants';

export function fetchGfwProLayers() {
  const layersData = [];
  const failedLayers = [];

  Object.values(proLayers).forEach((layerName) => {
    const layerConfiguration = mapLayers.find((mapLayer) => mapLayer.attributes.name === layerName);
    if (layerConfiguration) {
      layersData.push(layerConfiguration);
    } else {
      failedLayers.push(layerName);
    }
  });

  return layersData;
}
