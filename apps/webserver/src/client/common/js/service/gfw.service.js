import { proLayers } from '../proLayers.config';
import { mapLayers } from './mapLayers.constants';
import featureFlags from '../../../../utils/general.utils';

export async function fetchGfwProLayers() {
  const { isDegradedPastureLayerAvailable, isDcfAvailable } = featureFlags;

  const hideRules = {
    [proLayers.degradedPastureID]: !isDegradedPastureLayerAvailable,
    [proLayers.globalVegetationDisturbanceAlertsId]: !isDcfAvailable,
    [proLayers.integratedDeforestationAlertsID]: isDcfAvailable,
  };

  const shouldHideLayer = (layerName) => hideRules[layerName] ?? false;

  const layersData = Object.values(proLayers)
    .map((layerName) => mapLayers.find((mapLayer) => mapLayer.attributes.name === layerName))
    .filter((layerConfig) => layerConfig && !shouldHideLayer(layerConfig.attributes.name));

  return layersData;
}
