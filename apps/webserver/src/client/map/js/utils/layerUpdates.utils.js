import { proLayers } from '../../../common/js/config';
import store from '../store';

export const updateDeforestationAlertsLayers = (map, prevState) => {
  const { integratedDeforestationAlertsID, raddAlertsID, gladAlertsID } = proLayers;
  const {
    showHighConfidenceAlertsOnIntegratedAlertsLayer,
    showHighConfidenceAlertsOnRaddAlertsLayer,
    gladDateRange,
    gladConfirmed,
  } = store.getState();

  if (
    prevState.gladConfirmed !== gladConfirmed ||
    prevState.showHighConfidenceAlertsOnIntegratedAlertsLayer !==
      showHighConfidenceAlertsOnIntegratedAlertsLayer ||
    prevState.showHighConfidenceAlertsOnRaddAlertsLayer !==
      showHighConfidenceAlertsOnRaddAlertsLayer ||
    prevState.gladDateRange !== gladDateRange
  ) {
    [integratedDeforestationAlertsID, raddAlertsID, gladAlertsID].forEach(
      (deforestationAlertsLayer) => {
        const mapLayer = map.findLayerById(deforestationAlertsLayer);
        if (mapLayer) {
          const julianTo = parseInt(gladDateRange.end.getJulian(), 10);
          const julianFrom = parseInt(gladDateRange.start.getJulian(), 10);
          mapLayer.julianTo = julianTo;
          mapLayer.julianFrom = julianFrom;

          if (deforestationAlertsLayer === integratedDeforestationAlertsID) {
            mapLayer.highConfidenceConfirmed = showHighConfidenceAlertsOnIntegratedAlertsLayer;
          }
          if (deforestationAlertsLayer === raddAlertsID) {
            mapLayer.highConfidenceConfirmed = showHighConfidenceAlertsOnRaddAlertsLayer;
          }

          if (deforestationAlertsLayer === gladAlertsID) {
            mapLayer.confirmed = gladConfirmed;
          }

          const promise = new Promise((resolve) => {
            map.remove(mapLayer);
            resolve();
          });
          promise.then(() => {
            map.add(mapLayer);
          });
        }
      }
    );
  }
};
