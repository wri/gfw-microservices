import React, { useState } from 'react';
import { locationsPage } from '../../../../common/js/config';
import { analysisTypes } from '../../../../../config/env/analysisTypes.constants';

function AnalysisTypesSelector({ handleAnalyzesSelect }) {
  const { DEFORESTATION_KPIS, FOREST_CHANGE_DIAGNOSTICS, DEFORESTATION_ALERTS } = analysisTypes;
  return (
    <fieldset className="locations-upload-save">
      <legend className="locations-upload-save__legend">{locationsPage.upload.analytics}</legend>
      <div className="locations-upload-save__option-container">
        <input
          type="checkbox"
          name={FOREST_CHANGE_DIAGNOSTICS}
          id={FOREST_CHANGE_DIAGNOSTICS}
          onChange={() => handleAnalyzesSelect(FOREST_CHANGE_DIAGNOSTICS)}
        />
        <label htmlFor={FOREST_CHANGE_DIAGNOSTICS}>
          {locationsPage.upload.analysis.forestChange}
        </label>
      </div>

      <div className="locations-upload-save__option-container">
        <input
          type="checkbox"
          name={DEFORESTATION_KPIS}
          id={DEFORESTATION_KPIS}
          onChange={() => handleAnalyzesSelect(DEFORESTATION_KPIS)}
        />
        <label htmlFor={DEFORESTATION_KPIS}>
          {locationsPage.upload.analysis.deforestationReporting}
        </label>
      </div>

      <div className="locations-upload-save__option-container">
        <input
          type="checkbox"
          name={DEFORESTATION_ALERTS}
          id={DEFORESTATION_ALERTS}
          onChange={() => handleAnalyzesSelect(DEFORESTATION_ALERTS)}
        />
        <label htmlFor={DEFORESTATION_ALERTS}>
          {locationsPage.upload.analysis.deforestationAlert}
        </label>
      </div>
    </fieldset>
  );
}

export default AnalysisTypesSelector;
