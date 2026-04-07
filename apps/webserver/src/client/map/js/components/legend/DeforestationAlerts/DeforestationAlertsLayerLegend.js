import { useDispatch, useSelector } from 'react-redux';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import {
  toggleHighConfidenceAlertsForDeforestationAlertsLayers,
  toggleLayer,
  updateDeforestationAlertsDateRange,
} from '../../../actions/mapActions';
import DeforestationAlertsMapLegends from './DeforestationAlertsMapLegends';
import { deforestationAlertsLayerToCoverageMap } from './deforestationAlerts.constants';
import { DateRangeSlider } from '../../../../../components';
import { formatDateValue } from '../../../../../common/js/utils/dateUtils';

const DeforestationAlertsLayerLegend = ({ disabled, layerId }) => {
  const dispatch = useDispatch();
  const {
    visibleLayers,
    showHighConfidenceAlertsOnDeforestationAlertsLayer,
    deforestationAlertsDateRanges,
  } = useSelector((state) => ({
    visibleLayers: state.visibleLayers,
    showHighConfidenceAlertsOnDeforestationAlertsLayer:
      state.showHighConfidenceAlertsOnDeforestationAlertsLayer,
    deforestationAlertsDateRanges: state.deforestationAlertsDateRanges,
  }));
  const geographicCoverageLayer = deforestationAlertsLayerToCoverageMap[layerId];
  const isDisabled = !!disabled;
  const layerDateRange = deforestationAlertsDateRanges?.[layerId] || {};

  const todayIso = formatDateValue(new Date());
  const minDate = formatDateValue(layerDateRange.minDate) || todayIso;
  const maxDate = formatDateValue(layerDateRange.maxDate) || todayIso;
  const startDateValue = formatDateValue(layerDateRange.startDate) || minDate;
  const endDateValue = formatDateValue(layerDateRange.endDate) || maxDate;

  const toggleGeographicCoverageLayer = () => {
    if (!isDisabled) {
      dispatch(toggleLayer(geographicCoverageLayer));
    }
  };

  const toggleHighConfidenceAlerts = () => {
    if (!isDisabled) {
      dispatch(toggleHighConfidenceAlertsForDeforestationAlertsLayers());
    }
  };

  const handleDateRangeChange = (newStartDate, newEndDate) => {
    if (isDisabled) {
      return;
    }

    const nextStart = newStartDate || startDateValue;
    const nextEnd = newEndDate || endDateValue;

    if (nextStart !== layerDateRange.startDate || nextEnd !== layerDateRange.endDate) {
      dispatch(
        updateDeforestationAlertsDateRange({
          layerId,
          startDate: nextStart,
          endDate: nextEnd,
        })
      );
    }
  };

  // legends are different for the integratedDeforestationAlerts layer as it has a different color system
  const LegendSwitcher = ({ layerId }) => {
    return <DeforestationAlertsMapLegends alertsName={layerId} />;
  };

  return (
    <ul className="layer-legend">
      <LegendSwitcher layerId={layerId} />
      <li>
        <DateRangeSlider
          startDate={startDateValue}
          endDate={endDateValue}
          minDate={minDate}
          maxDate={maxDate}
          disabled={isDisabled}
          onDateChange={handleDateRangeChange}
        />
      </li>
      <li>
        <FormControlLabel
          control={
            <Checkbox
              checked={visibleLayers.includes(geographicCoverageLayer)}
              onChange={toggleGeographicCoverageLayer}
              disabled={isDisabled}
            />
          }
          label={<Typography variant="body2">Geographic coverage</Typography>}
          sx={{ ml: 0.5, mr: 0 }}
        />
      </li>
      <li>
        <FormControlLabel
          control={
            <Checkbox
              checked={showHighConfidenceAlertsOnDeforestationAlertsLayer}
              onChange={toggleHighConfidenceAlerts}
              disabled={isDisabled}
            />
          }
          label={<Typography variant="body2">Show only high confidence alerts</Typography>}
          sx={{ ml: 0.5, mr: 0 }}
        />
      </li>
    </ul>
  );
};

export default DeforestationAlertsLayerLegend;
