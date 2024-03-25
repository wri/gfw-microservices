import { proLayers } from '../../../../../common/js/config';
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
];

export const deforestationAlertsLayerToCoverageMap = {
  [integratedDeforestationAlertsID]: integratedAlertsGeographicCoverageID,
  [raddAlertsID]: raddCoverageID,
  [gladAlertsID]: gladLGeographicCoverageID,
  [gladS2AlertsID]: gladS2GeographicCoverageID,
};
