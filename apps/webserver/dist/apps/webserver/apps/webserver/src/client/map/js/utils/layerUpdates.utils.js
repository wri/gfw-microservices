import {
  deforestationAlertsIds,
  layersWithCanopyDensityThresholdControl,
} from '../components/legend/DeforestationAlerts/deforestationAlerts.constants';
import { proLayers } from '../../../common/js/proLayers.config';

// Function to remove and add a layer
const removeAndAddLayer = (map, layer) => {
  const promise = new Promise((resolve) => {
    map.remove(layer);
    resolve();
  });
  promise.then(() => {
    map.add(layer);
  });
};

export const updateInteractiveLayers = (map, prevState, state) => {
  const {
    showHighConfidenceAlertsOnDeforestationAlertsLayer,
    gladDateRange,
    canopyDensity,
    biomassRange,
    biomassLossDateRange,
    treeCoverLossDateRange,
  } = state;

  const { treeBiomassLossID, argentineanNativeForestsLoss, treeCoverLossID } = proLayers;

  // Update biomass layer
  if (
    prevState.biomassRange?.min !== biomassRange?.min ||
    prevState.biomassRange?.max !== biomassRange?.max ||
    prevState.biomassLossDateRange?.startYear !== biomassLossDateRange?.startYear ||
    prevState.biomassLossDateRange?.endYear !== biomassLossDateRange?.endYear
  ) {
    const mapLayer = map.findLayerById(treeBiomassLossID);
    if (mapLayer) {
      mapLayer.minRange = biomassRange.min;
      mapLayer.maxRange = biomassRange.max;
      mapLayer.minYear = biomassLossDateRange.startYear;
      mapLayer.maxYear = biomassLossDateRange.endYear;

      removeAndAddLayer(map, mapLayer);
    }
  }

  // update argentineanNativeForestsLoss and treeCoverLossID
  if (
    prevState.treeCoverLossDateRange?.startYear !== treeCoverLossDateRange?.startYear ||
    prevState.treeCoverLossDateRange?.endYear !== treeCoverLossDateRange?.endYear
  ) {
    [argentineanNativeForestsLoss, treeCoverLossID].forEach((treeCoverLossLayer) => {
      const mapLayer = map.findLayerById(treeCoverLossLayer);
      if (mapLayer) {
        mapLayer.minYear = treeCoverLossDateRange.startYear;
        mapLayer.maxYear = treeCoverLossDateRange.endYear;
        removeAndAddLayer(map, mapLayer);
      }
    });
  }

  if (prevState.canopyDensity !== canopyDensity) {
    layersWithCanopyDensityThresholdControl.forEach((layerId) => {
      const mapLayer = map.findLayerById(layerId);
      if (mapLayer) {
        mapLayer.threshold = canopyDensity;
        removeAndAddLayer(map, mapLayer);
      }
    });
  }

  if (
    prevState.showHighConfidenceAlertsOnDeforestationAlertsLayer !==
      showHighConfidenceAlertsOnDeforestationAlertsLayer ||
    prevState.gladDateRange !== gladDateRange
  ) {
    deforestationAlertsIds.forEach((deforestationAlertsLayer) => {
      const mapLayer = map.findLayerById(deforestationAlertsLayer);
      if (mapLayer) {
        const julianTo = parseInt(gladDateRange.end.getJulian(), 10);
        const julianFrom = parseInt(gladDateRange.start.getJulian(), 10);

        mapLayer.julianTo = julianTo;
        mapLayer.julianFrom = julianFrom;
        mapLayer.showHighConfidenceConfirmed = showHighConfidenceAlertsOnDeforestationAlertsLayer;

        removeAndAddLayer(map, mapLayer);
      }
    });
  }
};
