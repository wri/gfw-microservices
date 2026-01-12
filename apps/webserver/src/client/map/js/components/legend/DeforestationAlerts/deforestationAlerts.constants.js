import { proLayers } from '../../../../../common/js/proLayers.config';
const {
  integratedDeforestationAlertsID,
  raddAlertsID,
  gladAlertsID,
  gladLGeographicCoverageID,
  gladS2AlertsID,
  integratedAlertsGeographicCoverageID,
  gladS2GeographicCoverageID,
  raddCoverageID,
  aboveGroundBiomassId,
  treeBiomassLossID,
  treeCoverID,
  globalVegetationDisturbanceAlertsGeographicCoverageId,
  disturbanceAlertsDriversGeographicCoverageId,
} = proLayers;

export const layersWithCanopyDensityThresholdControl = [
  aboveGroundBiomassId,
  treeBiomassLossID,
  treeCoverID,
];

export const deforestationAlertsIds = [
  integratedDeforestationAlertsID,
  raddAlertsID,
  gladAlertsID,
  gladS2AlertsID,
];

export const deforestationAlertsGeographicCoverageIds = [
  integratedAlertsGeographicCoverageID,
  gladLGeographicCoverageID,
  gladS2GeographicCoverageID,
  raddCoverageID,
  globalVegetationDisturbanceAlertsGeographicCoverageId,
  disturbanceAlertsDriversGeographicCoverageId,
];

export const deforestationAlertsLayerToCoverageMap = {
  [integratedDeforestationAlertsID]: integratedAlertsGeographicCoverageID,
  [raddAlertsID]: raddCoverageID,
  [gladAlertsID]: gladLGeographicCoverageID,
  [gladS2AlertsID]: gladS2GeographicCoverageID,
};
