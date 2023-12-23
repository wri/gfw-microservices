import React from 'react';
import DatePickerControl from './DatePickerControl';
import { setGLADStartDate, setGLADEndDate } from '../../actions/analysisActions';
import store from '../../store';
import { deforestationAlertsIds } from './../legend/DeforestationAlerts/deforestationAlerts.constants';

const AdhocAnalysis = ({ dateSliderDateRange, visibleLayers }) => {
  const handleStartDate = (evt, date) => {
    store.dispatch(setGLADStartDate(date));
  };

  const handleEndDate = (evt, date) => {
    store.dispatch(setGLADEndDate(date));
  };

  const visible = visibleLayers.some((layerID) => deforestationAlertsIds.includes(layerID));

  return (
    <div className={`adhoc-analysis ${visible ? '' : 'hidden'}`}>
      <DatePickerControl
        start={dateSliderDateRange.start}
        end={dateSliderDateRange.end}
        changeStart={handleStartDate}
        changeEnd={handleEndDate}
      />
    </div>
  );
};

export default AdhocAnalysis;
