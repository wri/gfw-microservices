import React, { useState } from 'react';
import { locationsPage } from '../../config';
import { analysisTypesOptions } from '../../../../../config/env/analysisTypes.constants';

function AnalysisTypesSelector({ handleAnalyzesSelect }) {
  return (
    <fieldset className="locations-upload-save">
      <legend className="locations-upload-save__legend">{locationsPage.upload.analytics}</legend>
      {analysisTypesOptions.map(({ id, label }) => (
        <div key={id} className="locations-upload-save__option-container">
          <input type="checkbox" name={id} id={id} onChange={() => handleAnalyzesSelect(id)} />
          <label htmlFor={id}>{label}</label>
        </div>
      ))}
    </fieldset>
  );
}

export default AnalysisTypesSelector;
