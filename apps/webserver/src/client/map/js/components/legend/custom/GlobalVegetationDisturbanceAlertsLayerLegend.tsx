import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Select, MenuItem, InputLabel, SelectChangeEvent } from '@mui/material';
import { UPDATE_GLOBAL_VEGETATION_DISTURBANCE_ALERTS_FILTER } from '../../../constants/actionTypes';
import {
  dcfAlertsDateRange,
  disturbanceAlertsVegetationTypes,
} from '../../../../../common/js/config';
import { type MapReducerRootState } from '../../../reducers/mapReducerTypes';
import { DateRangeSlider } from '../../../../../components';

import './GlobalVegetationDisturbanceAlertsLayerLegend.scss';

interface GlobalVegetationDisturbanceAlertsLayerLegendProps {
  disabled: boolean;
}

export const GlobalVegetationDisturbanceAlertsLayerLegend = ({
  disabled,
}: GlobalVegetationDisturbanceAlertsLayerLegendProps) => {
  const dispatch = useDispatch();
  const globalVegetationDisturbanceAlertsFilter = useSelector(
    (state: MapReducerRootState) => state.globalVegetationDisturbanceAlertsFilter
  );

  const [vegetationType, setVegetationType] = useState(
    globalVegetationDisturbanceAlertsFilter.vegetationType
  );

  useEffect(() => {
    dispatch({
      type: UPDATE_GLOBAL_VEGETATION_DISTURBANCE_ALERTS_FILTER,
      payload: {
        ...globalVegetationDisturbanceAlertsFilter,
        vegetationType,
      },
    });
  }, [vegetationType]);

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    dispatch({
      type: UPDATE_GLOBAL_VEGETATION_DISTURBANCE_ALERTS_FILTER,
      payload: {
        ...globalVegetationDisturbanceAlertsFilter,
        startDate: newStartDate,
        endDate: newEndDate,
      },
    });
  };

  const handleVegetationTypeChange = (event: SelectChangeEvent<string>) => {
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
          <MenuItem value={disturbanceAlertsVegetationTypes.AllVegetation}>All vegetation</MenuItem>
          <MenuItem value={disturbanceAlertsVegetationTypes.TreeCover}>Tree cover</MenuItem>
        </Select>
      </Box>
      <DateRangeSlider
        startDate={globalVegetationDisturbanceAlertsFilter.startDate}
        endDate={globalVegetationDisturbanceAlertsFilter.endDate}
        minDate={dcfAlertsDateRange.min}
        maxDate={dcfAlertsDateRange.max}
        disabled={disabled}
        onDateChange={handleDateChange}
      />
    </Box>
  );
};
