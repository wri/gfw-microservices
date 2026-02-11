import {
  deforestationAlertsIds,
  layersWithCanopyDensityThresholdControl,
} from '../components/legend/DeforestationAlerts/deforestationAlerts.constants';
import { proLayers } from '../../../common/js/proLayers.config';
import { getJulianDate } from './dateUtils';
import { parseDateValue } from '../../../common/js/utils/dateUtils';

// Function to remove and add a layer
const redrawLayer = async (map, layer) => {
  if (!layer) {
    return; // safety check
  }
  const userLayer = map.findLayerById('user-locations');

  if (userLayer) {
    await map.remove(userLayer); // Clear user layer graphics if it exists
  }

  // Replace the target layer
  await map.remove(layer);
  await map.add(layer);

  // Re-add the user layer on top if it exists
  if (userLayer) {
    await map.add(userLayer);
    userLayer.refresh?.();
  }
};

const updateMapLayerAccordingToCanopy = (map, canopyDensity, layerId) => {
  const mapLayer = map.findLayerById(layerId);
  if (!mapLayer) {
    // safety check
    return;
  }
  mapLayer.threshold = canopyDensity;
  mapLayer.refresh?.();
};

export const updateInteractiveLayers = (map, prevState, state) => {
  const {
    showHighConfidenceAlertsOnDeforestationAlertsLayer,
    canopyDensity,
    treeCoverLossCanopyDensity,
    biomassRange,
    biomassLossDateRange,
    treeCoverLossDateRange,
    treeCoverGainDateRange,
    deforestationAlertsDateRanges,
  } = state;

  const { treeBiomassLossID, argentineanNativeForestsLoss, treeCoverLossID, treeCoverGainID } =
    proLayers;

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

      redrawLayer(map, mapLayer);
    }
  }

  // update argentineanNativeForestsLoss and treeCoverLossID
  if (
    prevState.treeCoverLossDateRange?.startYear !== treeCoverLossDateRange?.startYear ||
    prevState.treeCoverLossDateRange?.endYear !== treeCoverLossDateRange?.endYear
  ) {
    [argentineanNativeForestsLoss, treeCoverLossID].forEach((layerId) => {
      const mapLayer = map.findLayerById(layerId);
      if (mapLayer) {
        mapLayer.minYear = treeCoverLossDateRange.startYear;
        mapLayer.maxYear = treeCoverLossDateRange.endYear;
        redrawLayer(map, mapLayer);
      }
    });
  }

  if (
    prevState.treeCoverGainDateRange?.startYear !== treeCoverGainDateRange?.startYear ||
    prevState.treeCoverGainDateRange?.endYear !== treeCoverGainDateRange?.endYear
  ) {
    const mapLayer = map.findLayerById(treeCoverGainID);
    if (mapLayer) {
      mapLayer.minYear = treeCoverGainDateRange.startYear;
      mapLayer.maxYear = treeCoverGainDateRange.endYear;
      redrawLayer(map, mapLayer);
    }
  }

  if (prevState.canopyDensity !== canopyDensity) {
    layersWithCanopyDensityThresholdControl.forEach((layerId) => {
      updateMapLayerAccordingToCanopy(map, canopyDensity, layerId);
    });
  }

  if (prevState.treeCoverLossCanopyDensity !== treeCoverLossCanopyDensity) {
    updateMapLayerAccordingToCanopy(map, treeCoverLossCanopyDensity, treeCoverLossID);
  }

  const deforestationRangesUpdated = deforestationAlertsIds.some((layerId) => {
    const previousRange = prevState?.deforestationAlertsDateRanges?.[layerId];
    const nextRange = deforestationAlertsDateRanges?.[layerId];

    if (!previousRange && !nextRange) {
      return false;
    }

    return (
      previousRange?.startDate !== nextRange?.startDate ||
      previousRange?.endDate !== nextRange?.endDate
    );
  });

  if (
    prevState.showHighConfidenceAlertsOnDeforestationAlertsLayer !==
      showHighConfidenceAlertsOnDeforestationAlertsLayer ||
    deforestationRangesUpdated
  ) {
    deforestationAlertsIds.forEach((deforestationAlertsLayer) => {
      const mapLayer = map.findLayerById(deforestationAlertsLayer);
      if (mapLayer) {
        const layerRange = deforestationAlertsDateRanges?.[deforestationAlertsLayer];
        const layerStartDate =
          parseDateValue(layerRange?.startDate) || parseDateValue(layerRange?.minDate);
        const layerEndDate =
          parseDateValue(layerRange?.endDate) || parseDateValue(layerRange?.maxDate) || new Date();

        if (!layerStartDate || !layerEndDate) {
          return;
        }

        const julianTo = parseInt(getJulianDate(layerEndDate), 10);
        const julianFrom = parseInt(getJulianDate(layerStartDate), 10);

        mapLayer.julianTo = julianTo;
        mapLayer.julianFrom = julianFrom;
        mapLayer.showHighConfidenceConfirmed = showHighConfidenceAlertsOnDeforestationAlertsLayer;
        redrawLayer(map, mapLayer);
      }
    });
  }
};

/**
 * Updates the opacity of layers on the map based on the current state
 * @param {Object} map - ArcGIS map instance
 * @param {Object} prevLayerOpacity - Previous state of layer opacities
 * @param {Object} currentLayerOpacity - Current state of layer opacities
 */
export const updateLayerOpacity = (map, prevLayerOpacity, currentLayerOpacity) => {
  // If there are no changes in opacities, do nothing
  if (JSON.stringify(prevLayerOpacity) === JSON.stringify(currentLayerOpacity)) {
    return;
  }

  Object.entries(currentLayerOpacity).forEach(([layerId, opacity]) => {
    if (prevLayerOpacity[layerId] !== opacity) {
      const layer = map.findLayerById(layerId);
      if (layer) {
        layer.opacity = opacity;
      }
    }
  });
};
