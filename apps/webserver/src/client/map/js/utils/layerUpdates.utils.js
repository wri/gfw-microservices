import { deforestationAlertsIds } from '../components/legend/DeforestationAlerts/deforestationAlerts.constants';
import store from '../store';

export const updateDeforestationAlertsLayers = (map, prevState) => {
  const { showHighConfidenceAlertsOnIntegratedAlertsLayer, gladDateRange } = store.getState();

  if (
    prevState.showHighConfidenceAlertsOnIntegratedAlertsLayer !==
      showHighConfidenceAlertsOnIntegratedAlertsLayer ||
    prevState.gladDateRange !== gladDateRange
  ) {
    deforestationAlertsIds.forEach((deforestationAlertsLayer) => {
      const mapLayer = map.findLayerById(deforestationAlertsLayer);
      if (mapLayer) {
        const julianTo = parseInt(gladDateRange.end.getJulian(), 10);
        const julianFrom = parseInt(gladDateRange.start.getJulian(), 10);

        mapLayer.julianTo = julianTo;
        mapLayer.julianFrom = julianFrom;
        mapLayer.showHighConfidenceConfirmed = showHighConfidenceAlertsOnIntegratedAlertsLayer;

        const promise = new Promise((resolve) => {
          map.remove(mapLayer);
          resolve();
        });
        promise.then(() => {
          map.add(mapLayer);
        });
      }
    });
  }
};
