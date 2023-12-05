import { proLayers } from '../../../common/js/config';
import store from '../store';

const { integratedDeforestationAlertsID } = proLayers;

export const updateIntegratedDeforestationAlertsLayer = (map, prevState) => {
  const { showHighConfidenceAlertsOnIntegratedAlertsLayer, gladDateRange } = store.getState();

  if (
    prevState.showHighConfidenceAlertsOnIntegratedAlertsLayer !==
      showHighConfidenceAlertsOnIntegratedAlertsLayer ||
    prevState.gladDateRange !== gladDateRange
  ) {
    /*
    uncomment when geographic coverage layer is available
    const umdGladLandsatAlertsCoverageLayer = map.findLayerById(umdGladLandsatAlertsCoverageID);
    if (umdGladLandsatAlertsCoverageLayer) {
      umdGladLandsatAlertsCoverageLayer.visible = true;
    }
    */
    const mapLayer = map.findLayerById(integratedDeforestationAlertsID);
    if (mapLayer) {
      const julianTo = parseInt(gladDateRange.end.getJulian(), 10);
      const julianFrom = parseInt(gladDateRange.start.getJulian(), 10);

      mapLayer.gfwjulianTo = julianTo;
      mapLayer.gfwjulianFrom = julianFrom;
      mapLayer.highConfidenceConfirmed = showHighConfidenceAlertsOnIntegratedAlertsLayer;

      const promise = new Promise((resolve) => {
        map.remove(mapLayer);
        resolve();
      });
      promise.then(() => {
        map.add(mapLayer);
      });
    }
  }
};
