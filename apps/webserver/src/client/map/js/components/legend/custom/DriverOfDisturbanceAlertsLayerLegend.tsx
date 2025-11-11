import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Slider, Typography, Box } from '@mui/material';
import { driverOfDisturbanceAlertsDateRange } from '../../../../../common/js/config';
import { UPDATE_DRIVER_OF_DISTURBANCE_ALERTS_FILTER } from '../../../constants/actionTypes';
import { proLayers } from '../../../../../common/js/proLayers.config';
import { toggleLayer } from '../../../actions/mapActions';
import { formatDate, formatDisplayDate, MILLISECONDS_PER_DAY } from './legendDateUtils';
import { theme } from '../../../../../styles/theme';
import { type MapReducerRootState } from '../../../reducers/mapReducerTypes';

import './DriverOfDisturbanceAlertsLayerLegend.scss';

export const DriverOfDisturbanceAlertsLayerLegend = ({ disabled }) => {
  const dispatch = useDispatch();
  const { driverOfDisturbanceAlertsFilter, visibleLayers } = useSelector(
    (state: MapReducerRootState) => ({
      driverOfDisturbanceAlertsFilter: state.driverOfDisturbanceAlertsFilter,
      visibleLayers: state.visibleLayers,
    })
  );

  const { startDate, endDate } = driverOfDisturbanceAlertsFilter;

  const initialStartDate = new Date(startDate).getTime();
  const initialEndDate = new Date(endDate).getTime();
  const minDate = new Date(driverOfDisturbanceAlertsDateRange[0]).getTime();
  const maxDate = new Date(driverOfDisturbanceAlertsDateRange[1]).getTime();

  const [dateRange, setDateRange] = useState([initialStartDate, initialEndDate]);

  const handleDateChange = (_, newValue) => {
    setDateRange(newValue);
  };

  const toggleGeographicCoverageLayer = () => {
    if (!disabled) {
      dispatch(toggleLayer(proLayers.disturbanceAlertsDriversGeographicCoverageId));
    }
  };

  const handleDateChangeCommitted = (_, newValue) => {
    const [newStartTimestamp, newEndTimestamp] = newValue;
    const newStartDate = formatDate(newStartTimestamp);
    const newEndDate = formatDate(newEndTimestamp);

    dispatch({
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
      <Box sx={{ mr: 2.5, my: 2 }}>
        <Typography variant="body2" gutterBottom sx={{ textAlign: 'center' }}>
          From {formatDisplayDate(dateRange[0])} to {formatDisplayDate(dateRange[1])}
        </Typography>
        <Slider
          value={dateRange}
          onChange={handleDateChange}
          onChangeCommitted={handleDateChangeCommitted}
          min={minDate}
          max={maxDate}
          step={MILLISECONDS_PER_DAY}
          marks={[
            { value: minDate, label: formatDisplayDate(minDate) },
            { value: maxDate, label: formatDisplayDate(maxDate) },
          ]}
          disabled={disabled}
          sx={{
            color: theme.palette.primary.main,
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
            },
            '& .MuiSlider-markLabel': {
              fontSize: '0.75rem',
            },
            '& .MuiSlider-markLabel[data-index="0"]': {
              left: '9% !important',
            },
            '& .MuiSlider-markLabel[data-index="1"]': {
              left: '90% !important',
            },
          }}
        />
      </Box>
      <div
        style={{ padding: 0, marginTop: 0 }}
        onClick={toggleGeographicCoverageLayer}
        className={`layer-checkbox ${
          visibleLayers.includes(proLayers.disturbanceAlertsDriversGeographicCoverageId)
            ? 'active'
            : ''
        }`}
      >
        <span className="toggle-switch pointer">
          <span />
        </span>
        <span className="layer-checkbox-label pointer">Geographic coverage</span>
      </div>
    </>
  );
};
