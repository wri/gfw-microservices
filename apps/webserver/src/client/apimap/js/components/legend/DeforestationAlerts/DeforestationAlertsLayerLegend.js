import React from 'react';
import store from '../../../store';
import {
  toggleHighConfidenceAlertsForDeforestationAlertsLayers,
  toggleLayer,
} from '../../../actions/mapActions';
import IntegratedAlertsMapLegends from './IntegratedAlertsMapLegends';
import DeforestationAlertsMapLegends from './DeforestationAlertsMapLegends';
import { proLayers } from '../../../../../common/js/proLayers.config';
import { deforestationAlertsLayerToCoverageMap } from './deforestationAlerts.constants';
const { integratedDeforestationAlertsID } = proLayers;

const DeforestationAlertsLayerLegend = ({ disabled, layerId }) => {
  const { visibleLayers, showHighConfidenceAlertsOnDeforestationAlertsLayer } = store.getState();
  const geographicCoverageLayer = deforestationAlertsLayerToCoverageMap[layerId];

  const toggleGeographicCoverageLayer = () => {
    if (!disabled) {
      store.dispatch(toggleLayer(geographicCoverageLayer));
    }
  };

  const toggleHighConfidenceAlerts = () => {
    if (!disabled) {
      store.dispatch(toggleHighConfidenceAlertsForDeforestationAlertsLayers());
    }
  };

  // legends are different for the integratedDeforestationAlerts layer as it has a different color system
  const LegendSwitcher = ({ layerId }) => {
    switch (layerId) {
      case integratedDeforestationAlertsID:
        return <IntegratedAlertsMapLegends />;
      default:
        return <DeforestationAlertsMapLegends alertsName={layerId} />;
    }
  };

  return (
    <ul className="layer-legend">
      <LegendSwitcher layerId={layerId} />
      <li
        className={`layer-checkbox ${
          visibleLayers.includes(geographicCoverageLayer) ? 'active' : ''
        }`}
      >
        <div onClick={toggleGeographicCoverageLayer}>
          <span className="toggle-switch pointer">
            <span />
          </span>
          <span className="layer-checkbox-label pointer">Geographic coverage</span>
        </div>
      </li>
      <li
        className={`layer-checkbox ${
          showHighConfidenceAlertsOnDeforestationAlertsLayer ? 'active' : ''
        }`}
      >
        <div onClick={toggleHighConfidenceAlerts}>
          <span className="toggle-switch pointer">
            <span />
          </span>
          <span className="layer-checkbox-label pointer">Show only high confidence alerts</span>
        </div>
      </li>
    </ul>
  );
};

export default DeforestationAlertsLayerLegend;
