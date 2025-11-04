import store from '../../../store';
import { useState } from 'react';
import { Slider, Typography, Box } from '@mui/material';
import { driverOfDisturbanceAlertsDateRange } from '../../../../../common/js/config';
import { UPDATE_DRIVER_OF_DISTURBANCE_ALERTS_FILTER } from '../../../constants/actionTypes';
('../constants/actionTypes');

import './DriverOfDisturbanceAlertsLayerLegend.scss';

export const DriverOfDisturbanceAlertsLayerLegend = ({ disabled }) => {
  const { driverOfDisturbanceAlertsFilter } = store.getState();

  const initialStartDate = new Date(driverOfDisturbanceAlertsFilter.startDate).getTime();
  const initialEndDate = new Date(driverOfDisturbanceAlertsFilter.endDate).getTime();
  const minDate = new Date(driverOfDisturbanceAlertsDateRange[0]).getTime();
  const maxDate = new Date(driverOfDisturbanceAlertsDateRange[1]).getTime();

  const [dateRange, setDateRange] = useState([initialStartDate, initialEndDate]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const formatDisplayDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleDateChange = (event, newValue) => {
    setDateRange(newValue);
  };

  const handleDateChangeCommitted = (event, newValue) => {
    const [newStartTimestamp, newEndTimestamp] = newValue;
    const newStartDate = formatDate(newStartTimestamp);
    const newEndDate = formatDate(newEndTimestamp);

    store.dispatch({
      type: UPDATE_DRIVER_OF_DISTURBANCE_ALERTS_FILTER,
      payload: {
        startDate: newStartDate,
        endDate: newEndDate,
      },
    });
  };

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
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="body2" gutterBottom>
          From {formatDisplayDate(dateRange[0])} to {formatDisplayDate(dateRange[1])}
        </Typography>
        <Slider
          value={dateRange}
          onChange={handleDateChange}
          onChangeCommitted={handleDateChangeCommitted}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatDisplayDate(value)}
          min={minDate}
          max={maxDate}
          step={86400000}
          marks={[
            { value: minDate, label: formatDisplayDate(minDate) },
            { value: maxDate, label: formatDisplayDate(maxDate) },
          ]}
          disabled={disabled}
          sx={{
            color: '#97bd3d',
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
            },
            '& .MuiSlider-markLabel': {
              fontSize: '0.75rem',
            },
            '& .MuiSlider-markLabel[data-index="0"]': {
              left: '5% !important',
            },
            '& .MuiSlider-markLabel[data-index="1"]': {
              left: '90% !important',
            },
          }}
        />
      </Box>
      <div style={{ marginTop: '10px' }}>
        <span className="toggle-switch pointer">
          <span />
        </span>
        <span className="layer-checkbox-label pointer">Geographic coverage</span>
      </div>
    </>
  );
};
