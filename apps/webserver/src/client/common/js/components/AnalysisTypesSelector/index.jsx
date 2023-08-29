import React, { useState } from 'react';
import { locationsPage } from '../../config';
import { analysisTypesOptions } from '../../../../../config/env/analysisTypes.constants';

function AnalysisTypesSelector({ handleAnalyzesSelection }) {
  const [selectedAnalysis, setSelectedAnalysis] = useState([]);

  const analysisTypesSwitch = (type) => {
    let selection;
    if (selectedAnalysis.includes(type)) {
      selection = selectedAnalysis.filter(e => e !== type);
    } else {
      selection = [...selectedAnalysis, type];
    }
    setSelectedAnalysis(selection);
    handleAnalyzesSelection(selection)
  };

  return (
    <fieldset style={{ border: 'none' }}>
      <legend className="locations-upload-save__legend">{locationsPage.upload.analytics}</legend>
      {analysisTypesOptions.map(({ id, label }) => (
        <div key={id} className="locations-upload-save__option-container">
          <input type="checkbox" name={id} id={id} onChange={() => analysisTypesSwitch(id)} />
          <label htmlFor={id}>{label}</label>
        </div>
      ))}
    </fieldset>
  );
}

export default AnalysisTypesSelector;
