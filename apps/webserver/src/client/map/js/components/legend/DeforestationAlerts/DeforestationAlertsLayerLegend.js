import { useDispatch, useSelector } from 'react-redux';
import {
  toggleHighConfidenceAlertsForDeforestationAlertsLayers,
  toggleLayer,
  updateDeforestationAlertsDateRange,
} from '../../../actions/mapActions';
import IntegratedAlertsMapLegends from './IntegratedAlertsMapLegends';
import DeforestationAlertsMapLegends from './DeforestationAlertsMapLegends';
import { proLayers } from '../../../../../common/js/proLayers.config';
import { deforestationAlertsLayerToCoverageMap } from './deforestationAlerts.constants';
import { DateRangeSlider } from '../../../../../components';
const { integratedDeforestationAlertsID } = proLayers;

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

  const formatDateValue = (value) => {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    const timestamp = date.getTime();
    if (Number.isNaN(timestamp)) {
      return '';
    }

    return date.toISOString().split('T')[0];
  };

  const todayIso = formatDateValue(new Date());
  const sliderStartDate = formatDateValue(layerDateRange.startDate) || todayIso;
  const sliderEndDate = formatDateValue(layerDateRange.endDate) || todayIso;
  const sliderMinDate = formatDateValue(layerDateRange.minDate) || sliderStartDate;
  const sliderMaxDate = formatDateValue(layerDateRange.maxDate) || todayIso;
  const startDateValue = sliderStartDate || sliderMinDate || sliderMaxDate;
  const endDateValue = sliderEndDate || sliderMaxDate;

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
    switch (layerId) {
      case integratedDeforestationAlertsID:
        return <IntegratedAlertsMapLegends />;
      default:
        return <DeforestationAlertsMapLegends alertsName={layerId} />;
    }
  };

  return (
    <ul className="layer-legend">
      <LegendSwitcher layerId={layerId} />
      <li>
        <DateRangeSlider
          startDate={startDateValue}
          endDate={endDateValue}
          minDate={sliderMinDate || startDateValue}
          maxDate={sliderMaxDate}
          disabled={isDisabled}
          onDateChange={handleDateRangeChange}
        />
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
