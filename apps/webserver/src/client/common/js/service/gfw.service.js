import esriRequest from '@arcgis/core/request';

// Configs
import { mapPage } from '../config';
import { proLayers } from '../proLayers.config';
import { PRODUCTION_ENVIRONMENTS } from '../../../../config/config/environments.config';

// eslint-disable-next-line import/prefer-default-export
export async function fetchGfwProLayers() {
  const layersData = [];
  const failedLayers = [];

  /*
   * PRO layers are held in the single API endpoint but differentiated by environment flag, so we fetch both
   * layer lists, production and staging depending on the current environment. If we are in staging, we look
   * for staging layers, but if those are not found, we fallback to production layers. Production environment
   * does not have this fallback.
   */
  const layerURL = PRODUCTION_ENVIRONMENTS.includes(window.CURRENT_ENVIRONMENT)
    ? mapPage.gfw_production_layers_url
    : mapPage.gfw_staging_layers_url;
  const apiLayers = await esriRequest(layerURL, { responseType: 'json' });

  Object.values(proLayers).forEach((layerName) => {
    const apiLayer = apiLayers.data.data.find(
      (apiLayerRes) => apiLayerRes.attributes.name === layerName
    );
    if (apiLayer) {
      layersData.push(apiLayer);
    } else {
      failedLayers.push(layerName);
    }
  });

  if (failedLayers.length > 0 && !PRODUCTION_ENVIRONMENTS.includes(window.CURRENT_ENVIRONMENT)) {
    const prodAPILayers = await esriRequest(mapPage.gfw_production_layers_url, {
      responseType: 'json',
    });
    failedLayers.forEach((layerName) => {
      const apiLayer = prodAPILayers.data.data.find(
        (apiLayerRes) => apiLayerRes.attributes.name === layerName
      );
      if (apiLayer) {
        layersData.push(apiLayer);
      }
    });
  }

  return layersData;
}
