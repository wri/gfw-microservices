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

  const mapLayersByName = Object.fromEntries(mapLayers.map((l) => [l.attributes.name, l]));

  const layersData = Object.values(proLayers)
    .map((name) => mapLayersByName[name])
    .filter((layer) => layer && !shouldHideLayer(layer.attributes.name));

  return layersData;
}
