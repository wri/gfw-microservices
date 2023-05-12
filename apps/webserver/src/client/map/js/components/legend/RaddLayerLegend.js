import React from 'react';
import store from '../../store';
import { proLayers } from '../../../../common/js/config';
import { toggleLayer } from '../../actions/mapActions';
const { raddAlertsID, raddCoverageID } = proLayers;

const RaddLayerLegend = ({ disabled, layer }) => {
  const recentAlertsColor =
    layer?.legendConfig?.items[0]?.categories?.find((symbol) => symbol.name === 'Recent alerts')?.color || '#e4c600';

  const toggleRaddCoverageLayer = () => {
    if (!disabled) {
      store.dispatch(toggleLayer(raddCoverageID));
    }
  };

  const toggleRaddConfirmedLayer = () => {
    if (!disabled) {
      store.dispatch(toggleLayer(raddAlertsID));
    }
  };

  return (
    <ul className="layer-legend">
      <li key={0}>
        <div>
          <span
            className="layer-legend-symbol"
            style={{
              background: recentAlertsColor,
            }}
          ></span>
          <span className="layer-legend-label">{'Recent alerts'}</span>
        </div>
      </li>
      <li
        key={1}
        className={`layer-checkbox ${store.getState().visibleLayers.includes(raddCoverageID) ? 'active' : ''}`}
      >
        <div>
          <span onClick={toggleRaddCoverageLayer} className="toggle-switch pointer">
            <span />
          </span>
          <span onClick={toggleRaddCoverageLayer} className="layer-checkbox-label pointer">
            {'Geographic coverage'}
          </span>
        </div>
      </li>
      <li key={2} className={`layer-checkbox ${store.getState().visibleLayers.includes(raddAlertsID) ? 'active' : ''}`}>
        <div>
          <span onClick={toggleRaddConfirmedLayer} className="toggle-switch pointer">
            <span />
          </span>
          <span onClick={toggleRaddConfirmedLayer} className="layer-checkbox-label pointer">
            {'Show only high confidence alerts'}
          </span>
        </div>
      </li>
    </ul>
  );
};

export default RaddLayerLegend;
