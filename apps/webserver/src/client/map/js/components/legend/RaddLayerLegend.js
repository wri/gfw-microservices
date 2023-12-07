import React from 'react';
import store from '../../store';
import { proLayers } from '../../../../common/js/config';
import {
  toggleLayer,
  toggleHighConfidenceAlertsForRaddAlertsLayer,
} from '../../actions/mapActions';
const { raddCoverageID } = proLayers;

const RaddLayerLegend = ({ disabled }) => {
  const { visibleLayers, showHighConfidenceAlertsOnRaddAlertsLayer } = store.getState();
  const toggleRaddCoverageLayer = () => {
    if (!disabled) {
      store.dispatch(toggleLayer(raddCoverageID));
    }
  };

  const toggleRaddConfirmedLayer = () => {
    if (!disabled) {
      store.dispatch(toggleHighConfidenceAlertsForRaddAlertsLayer());
    }
  };

  return (
    <ul className="layer-legend">
      <li className={`layer-checkbox ${visibleLayers.includes(raddCoverageID) ? 'active' : ''}`}>
        <div onClick={toggleRaddCoverageLayer}>
          <span className="toggle-switch pointer">
            <span />
          </span>
          <span className="layer-checkbox-label pointer">Geographic coverage</span>
        </div>
      </li>
      <li className={`layer-checkbox ${showHighConfidenceAlertsOnRaddAlertsLayer ? 'active' : ''}`}>
        <div onClick={toggleRaddConfirmedLayer}>
          <span className="toggle-switch pointer">
            <span />
          </span>
          <span className="layer-checkbox-label pointer">Show only high confidence alerts</span>
        </div>
      </li>
    </ul>
  );
};

export default RaddLayerLegend;
