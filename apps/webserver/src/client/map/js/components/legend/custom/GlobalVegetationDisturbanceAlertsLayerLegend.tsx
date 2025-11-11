import { useEffect, useState } from 'react';
import store from '../../../store';
import { useSelector } from 'react-redux';
import { Slider, Typography, Box, Select, MenuItem, InputLabel } from '@mui/material';
import { UPDATE_GLOBAL_VEGETATION_DISTURBANCE_ALERTS_FILTER } from '../../../constants/actionTypes';
import {
  globalVegetationDisturbanceAlertsDateRange,
  globalVegetationDisturbanceAlertsVegetationTypes,
} from '../../../../../common/js/config';
import { formatDate, formatDisplayDate, MILLISECONDS_PER_DAY } from './legendDateUtils';
import { theme } from '../../../../../styles/theme';
import { type MapReducerRootState } from '../../../reducers/mapReducerTypes';

import './GlobalVegetationDisturbanceAlertsLayerLegend.scss';

export const GlobalVegetationDisturbanceAlertsLayerLegend = ({ disabled }) => {
  const globalVegetationDisturbanceAlertsFilter = useSelector(
    (state: MapReducerRootState) => state.globalVegetationDisturbanceAlertsFilter
  );

  const initialStartDate = new Date(globalVegetationDisturbanceAlertsFilter.startDate).getTime();
  const initialEndDate = new Date(globalVegetationDisturbanceAlertsFilter.endDate).getTime();
  const minDate = new Date(globalVegetationDisturbanceAlertsDateRange[0]).getTime();
  const maxDate = new Date(globalVegetationDisturbanceAlertsDateRange[1]).getTime();

  const [dateRange, setDateRange] = useState([initialStartDate, initialEndDate]);
  const [vegetationType, setVegetationType] = useState(
    globalVegetationDisturbanceAlertsFilter.vegetationType
  );

  const handleDateChange = (_, newValue) => {
    setDateRange(newValue);
  };

  useEffect(() => {
    store.dispatch({
      type: UPDATE_GLOBAL_VEGETATION_DISTURBANCE_ALERTS_FILTER,
      payload: {
        ...globalVegetationDisturbanceAlertsFilter,
        vegetationType,
      },
    });
  }, [vegetationType]);

  const handleDateChangeCommitted = (_, newValue) => {
    const [newStartTimestamp, newEndTimestamp] = newValue;
    const newStartDate = formatDate(newStartTimestamp);
    const newEndDate = formatDate(newEndTimestamp);

    store.dispatch({
      type: UPDATE_GLOBAL_VEGETATION_DISTURBANCE_ALERTS_FILTER,
      payload: {
        ...globalVegetationDisturbanceAlertsFilter,
        startDate: newStartDate,
        endDate: newEndDate,
      },
    });
  };

  const handleVegetationTypeChange = (event) => {
    setVegetationType(event.target.value);
  };

  return (
    <Box className="global-vegetation-disturbance-alerts-layer-legend">
      <ul className="layer-legend">
        <div>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: '#EEB1B1',
                }}
              />
              <span className="layer-legend-label">Low confidence: detected 2-3 times</span>
            </div>
          </li>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: '#895277',
                }}
              />
              <span className="layer-legend-label">
                High confidence: detected more than 3 times
              </span>
            </div>
          </li>
        </div>
      </ul>
      <Box className="global-vegetation-disturbance-alerts-layer-legend__vegetation">
        <InputLabel id="vegetation-type-label">Displaying DIST-ALERT in</InputLabel>
        <Select
          labelId="vegetation-type-label"
          id="vegetation-type-select"
          value={vegetationType}
          onChange={handleVegetationTypeChange}
          disabled={disabled}
        >
          <MenuItem value={globalVegetationDisturbanceAlertsVegetationTypes.AllVegetation}>
            All vegetation
          </MenuItem>
          <MenuItem value={globalVegetationDisturbanceAlertsVegetationTypes.TreeCover}>
            Tree cover
          </MenuItem>
        </Select>
      </Box>
      <Box sx={{ mr: 2.5, mt: 2 }}>
        <Typography variant="body2" gutterBottom sx={{ textAlign: 'center' }}>
          From {formatDisplayDate(dateRange[0])} to {formatDisplayDate(dateRange[1])}
        </Typography>
        <Slider
          value={dateRange}
          onChange={handleDateChange}
          onChangeCommitted={handleDateChangeCommitted}
          valueLabelDisplay="off"
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
    </Box>
  );
};
