import React from 'react';
import store from '../../../store';
import {
  toggleLayer,
  toggleHighConfidenceAlertsForIntegratedAlertsLayer,
} from '../../../actions/mapActions';
import IntegratedAlertsMapLegends from './IntegratedAlertsMapLegends';

const IntegratedDeforestationAlertsLayerLegend = ({ disabled, geographicCoverageLayer }) => {
  const { visibleLayers, showHighConfidenceAlertsOnIntegratedAlertsLayer } = store.getState();
  const toggleGeographicCoverageLayer = () => {
    if (!disabled) {
      store.dispatch(toggleLayer(geographicCoverageLayer));
    }
  };

  const toggleHighConfidenceAlerts = () => {
    if (!disabled) {
      store.dispatch(toggleHighConfidenceAlertsForIntegratedAlertsLayer());
    }
  };

  return (
    <ul className="layer-legend">
      <IntegratedAlertsMapLegends />
      <li
        className={`layer-checkbox ${
          visibleLayers.includes(geographicCoverageLayer) ? 'active' : ''
        }`}
      >
        {/* uncomment when we have the Geographic coverag endpoint avaiable */}
        {/*<div onClick={toggleGeographicCoverageLayer}>
          <span className="toggle-switch pointer">
            <span />
          </span>
          <span className="layer-checkbox-label pointer">Geographic coverage</span>
      </div>*/}
      </li>
      <li
        className={`layer-checkbox ${
          showHighConfidenceAlertsOnIntegratedAlertsLayer ? 'active' : ''
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

export default IntegratedDeforestationAlertsLayerLegend;
