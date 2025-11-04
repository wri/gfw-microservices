import './DriverOfDisturbanceAlertsLayerLegend.scss';

export const DriverOfDisturbanceAlertsLayerLegend = ({ disabled, layerId }) => {
  return (
    <>
      <ul className="layer-legend">
        <div className="legend-list-of-driver-of-disturbance-alerts">
          <span>Non-natural drivers (human caused)</span>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: '#FFD966',
                }}
              />
              <span className="layer-legend-label">Small-scale agriculture</span>
            </div>
          </li>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: '#FF8C42',
                }}
              />
              <span className="layer-legend-label">Small-scale agriculture (fire)</span>
            </div>
          </li>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: '#F4B183',
                }}
              />
              <span className="layer-legend-label">Large-scale agriculture</span>
            </div>
          </li>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: '#CE4D1E',
                }}
              />
              <span className="layer-legend-label">Large-scale agriculture (fire)</span>
            </div>
          </li>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: '#FF0000',
                }}
              />
              <span className="layer-legend-label">Road development</span>
            </div>
          </li>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: '#00B0F0',
                }}
              />
              <span className="layer-legend-label">Selective logging</span>
            </div>
          </li>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: '#BC9DD9',
                }}
              />
              <span className="layer-legend-label">Mining</span>
            </div>
          </li>
          <span>Natural drivers</span>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: '#469990',
                }}
              />
              <span className="layer-legend-label">Flooding</span>
            </div>
          </li>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: '#3A1F9A',
                }}
              />
              <span className="layer-legend-label">Other natural disturbance</span>
            </div>
          </li>
          <span>Other drivers</span>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: '#895128',
                }}
              />
              <span className="layer-legend-label">Wildfire</span>
            </div>
          </li>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: '#EDA4C3',
                }}
              />
              <span className="layer-legend-label">Unlabeled</span>
            </div>
          </li>
        </div>
      </ul>
      <div style={{ marginTop: '10px' }}>
        <span className="toggle-switch pointer">
          <span />
        </span>
        <span className="layer-checkbox-label pointer">Geographic coverage</span>
      </div>
    </>
  );
};
