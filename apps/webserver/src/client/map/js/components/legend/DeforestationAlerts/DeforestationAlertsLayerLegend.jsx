import store from '../../../store';
import {
  toggleHighConfidenceAlertsForDeforestationAlertsLayers,
  toggleLayer,
} from '../../../actions/mapActions';
import { deforestationAlertsLayerToCoverageMap } from './deforestationAlerts.constants';

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

  return (
    <ul className="layer-legend">
      <li style={{ paddingTop: '6px' }}>
        <div>
          <span
            className="layer-legend-symbol"
            style={{
              background: 'rgb(224, 190, 7)',
            }}
          />
          <span className="layer-legend-label">Recent Alerts</span>
        </div>
      </li>
      <li>
        <div>
          <span
            className="layer-legend-symbol"
            style={{
              background: 'rgb(220, 102, 153)',
            }}
          />
          <span className="layer-legend-label">{layerId}</span>
        </div>
      </li>
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
