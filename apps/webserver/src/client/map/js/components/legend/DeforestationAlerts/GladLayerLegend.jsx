import React from 'react';
import store from '../../../store';
import { toggleGladConfirmed } from '../../../actions/analysisActions';
import IntegratedAlertsMapLegends from './IntegratedAlertsMapLegends';

function GladLayerLegend({ disabled, gladConfirmed }) {
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

         <IntegratedAlertsMapLegends />





      <li className={`layer-checkbox ${gladConfirmed ? 'active' : ''}`}>
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
