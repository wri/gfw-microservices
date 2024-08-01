import React from 'react';

const DeforestationAlertsMapLegends = ({ alertsName }) => {
  return (
    <>
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
          <span className="layer-legend-label">{alertsName}</span>
        </div>
      </li>
    </>
  );
};

export default DeforestationAlertsMapLegends;
