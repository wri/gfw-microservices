import React from 'react';
import DatePickerControl from './DatePickerControl';
import { setGLADStartDate, setGLADEndDate } from '../../actions/analysisActions';
import { proLayers } from '../../../../common/js/config';
import store from '../../store';

const { integratedDeforestationAlertsID, raddAlertsID, gladAlertsID } = proLayers;

const AdhocAnalysis = ({ dateSliderDateRange, visibleLayers }) => {
  const handleStartDate = (evt, date) => {
    store.dispatch(setGLADStartDate(date));
  };

  const handleEndDate = (evt, date) => {
    store.dispatch(setGLADEndDate(date));
  };

  const visible =
    visibleLayers.includes(gladAlertsID) ||
    visibleLayers.includes(integratedDeforestationAlertsID) ||
    visibleLayers.includes(raddAlertsID);

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
