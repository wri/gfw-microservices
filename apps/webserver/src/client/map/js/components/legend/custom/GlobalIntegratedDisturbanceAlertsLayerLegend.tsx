import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Select, MenuItem, InputLabel, Typography, SelectChangeEvent } from '@mui/material';
import { UPDATE_GLOBAL_INTEGRATED_DISTURBANCE_ALERTS_FILTER } from '../../../constants/actionTypes';
import { proLayers } from '../../../../../common/js/proLayers.config';
import { toggleLayer } from '../../../actions/mapActions';
import {
  globalIntegratedDisturbanceAlertsDateRange,
  disturbanceAlertsVegetationTypes,
} from '../../../../../common/js/config';
import { type MapReducerRootState } from '../../../reducers/mapReducerTypes';
import { DateRangeSlider } from '../../../../../components';

interface GlobalIntegratedDisturbanceAlertsLayerLegendProps {
  disabled: boolean;
}

export const GlobalIntegratedDisturbanceAlertsLayerLegend = ({
  disabled,
}: GlobalIntegratedDisturbanceAlertsLayerLegendProps) => {
  const dispatch = useDispatch();

  const { globalIntegratedDisturbanceAlertsFilter, visibleLayers } = useSelector(
    (state: MapReducerRootState) => ({
      globalIntegratedDisturbanceAlertsFilter: state.globalIntegratedDisturbanceAlertsFilter,
      visibleLayers: state.visibleLayers,
    })
  );

  const [vegetationType, setVegetationType] = useState(
    globalIntegratedDisturbanceAlertsFilter.vegetationType
  );

  const [onlyHighConfidenceAlerts, setOnlyHighConfidenceAlerts] = useState(
    globalIntegratedDisturbanceAlertsFilter.onlyHighConfidenceAlerts
  );

  useEffect(() => {
    dispatch({
      type: UPDATE_GLOBAL_INTEGRATED_DISTURBANCE_ALERTS_FILTER,
      payload: {
        ...globalIntegratedDisturbanceAlertsFilter,
        vegetationType,
      },
    });
  }, [vegetationType]);

  useEffect(() => {
    dispatch({
      type: UPDATE_GLOBAL_INTEGRATED_DISTURBANCE_ALERTS_FILTER,
      payload: {
        ...globalIntegratedDisturbanceAlertsFilter,
        onlyHighConfidenceAlerts,
      },
    });
  }, [onlyHighConfidenceAlerts]);

  const toggleHighConfidenceAlerts = () => {
    if (!disabled) {
      setOnlyHighConfidenceAlerts(!onlyHighConfidenceAlerts);
    }
  };

  const toggleGeographicCoverageLayer = () => {
    if (!disabled) {
      dispatch(toggleLayer(proLayers.integratedAlertsGeographicCoverageID));
    }
  };

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    dispatch({
      type: UPDATE_GLOBAL_INTEGRATED_DISTURBANCE_ALERTS_FILTER,
      payload: {
        ...globalIntegratedDisturbanceAlertsFilter,
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
          <li style={{ paddingTop: '6px' }}>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: 'rgb(237, 164, 195)',
                }}
              />
              <span className="layer-legend-label">
                Detected at low confidence by a single alert system
              </span>
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
              <span className="layer-legend-label">
                High confidence: detected at high confidence by a single alert system
              </span>
            </div>
          </li>
          <li>
            <div>
              <span
                className="layer-legend-symbol"
                style={{
                  background: 'rgb(201, 42, 109)',
                }}
              />
              <span className="layer-legend-label">
                Highest confidence: detected by more than one alert system
              </span>
            </div>
          </li>
        </div>
      </ul>
      <div
        style={{ padding: 0, marginTop: '4px', marginLeft: '16px' }}
        onClick={toggleHighConfidenceAlerts}
        className={`layer-checkbox ${
          globalIntegratedDisturbanceAlertsFilter.onlyHighConfidenceAlerts ? 'active' : ''
        }`}
      >
        <span className="toggle-switch pointer">
          <span />
        </span>
        <span className="layer-checkbox-label pointer">Show only high confidence alerts</span>
      </div>
      <Typography sx={{ fontSize: '0.875rem', marginTop: '10px' }}>Geographic coverage</Typography>
      <Box style={{ padding: 0, marginTop: 0 }}>
        <Box
          onClick={toggleGeographicCoverageLayer}
          className={`layer-checkbox ${
            visibleLayers.includes(proLayers.integratedAlertsGeographicCoverageID) ? 'active' : ''
          }`}
        >
          <span className="toggle-switch pointer">
            <span />
          </span>
          <span
            className="layer-legend-symbol"
            style={{
              background: '#E7CBE0',
              marginLeft: '4px',
            }}
          />
          <span className="layer-checkbox-label pointer" style={{ paddingLeft: 0 }}>
            GLAD-L, GLAD-S2 and/or RADD alerts (tropics)
          </span>
        </Box>
        {/* TODO: Remove comment when enabling the Disturbance alerts (global) alerts coverage layer */}
        {/* <Box className={`layer-checkbox`}>
          <span className="toggle-switch pointer">
            <span />
          </span>
          <span
            className="layer-legend-symbol"
            style={{
              background: '#E7CBE070',
              marginLeft: '4px',
            }}
          />
          <span className="layer-checkbox-label pointer" style={{ paddingLeft: 0 }}>
            Disturbance alerts (global)
          </span>
        </Box> */}
      </Box>
      <DateRangeSlider
        startDate={globalIntegratedDisturbanceAlertsFilter.startDate}
        endDate={globalIntegratedDisturbanceAlertsFilter.endDate}
        minDate={globalIntegratedDisturbanceAlertsDateRange[0]}
        maxDate={globalIntegratedDisturbanceAlertsDateRange[1]}
        disabled={disabled}
        onDateChange={handleDateChange}
      />
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
    </Box>
  );
};
