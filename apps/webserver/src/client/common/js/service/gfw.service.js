import { proLayers } from '../proLayers.config';
import { mapLayers } from './mapLayers.constants';

export async function fetchGfwProLayers() {
  const mapLayersByName = Object.fromEntries(mapLayers.map((l) => [l.attributes.name, l]));

  const layersData = Object.values(proLayers)
    .map((name) => mapLayersByName[name])
    .filter((layer) => !!layer);

  return layersData;
}
