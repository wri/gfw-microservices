import React from 'react';

// Store
import store from '../../store';
import { toggleGladConfirmed } from '../../actions/analysisActions';

function GladLayerLegend({ disabled, layer, gladConfirmed }) {
  const recentAlertsColor =
    layer?.legendConfig?.items[0]?.categories?.find((symbol) => symbol.name === 'Recent alerts')
      ?.color || '#e4c600';

  const toggleHighConfidenceAlertsGladLayer = (event, eventType) => {
    if (!disabled) {
      if (eventType === 'click') {
        store.dispatch(toggleGladConfirmed());
      }

      if (eventType === 'key' && (event.key === 'Enter' || event.key === ' ')) {
        store.dispatch(toggleGladConfirmed());
      }
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
          />
          <span className="layer-legend-label">Recent alerts</span>
        </div>
      </li>
      <li key={2} className={`layer-checkbox ${gladConfirmed ? 'active' : ''}`}>
        <div>
          <span
            className="toggle-switch pointer"
            onClick={(event) => toggleHighConfidenceAlertsGladLayer(event, 'click')}
            onKeyDown={(event) => toggleHighConfidenceAlertsGladLayer(event, 'key')}
            role="button"
            tabIndex="0"
          >
            <span />
          </span>
          <span
            className="layer-checkbox-label pointer"
            onClick={(event) => toggleHighConfidenceAlertsGladLayer(event, 'click')}
            onKeyDown={(event) => toggleHighConfidenceAlertsGladLayer(event, 'key')}
            role="button"
            tabIndex="0"
          >
            Show only high confidence alerts
          </span>
        </div>
      </li>
    </ul>
  );
}

export default GladLayerLegend;
