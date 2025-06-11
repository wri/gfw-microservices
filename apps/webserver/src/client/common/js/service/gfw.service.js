import { proLayers } from '../proLayers.config';
import { mapLayers } from './mapLayers.constants';
import featureFlags from '../../../../utils/general.utils';

export async function fetchGfwProLayers() {
  const layersData = [];
  const { isDegradedPastureLayerAvailable } = featureFlags;

  Object.values(proLayers).forEach((layerName) => {
    const layerConfiguration = mapLayers.find((mapLayer) => mapLayer.attributes.name === layerName);

    if (
      !layerConfiguration ||
      (!isDegradedPastureLayerAvailable &&
        layerConfiguration.attributes.name === proLayers.pastureRecoveryPotential)
    ) {
      return;
    }

    layersData.push(layerConfiguration);
  });

  return layersData;
}
