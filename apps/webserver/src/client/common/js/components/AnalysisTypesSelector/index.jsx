import React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { locationsPage } from '../../config';
import { analysisTypesOptions } from '../../../../../config/env/analysisTypes.constants';
import './AnalysisTypesSelector.scss';

function AnalysisTypesSelector({ selectedAnalysis, handleAnalyzesSelection }) {
  return (
    <FormGroup className="analysis-types-selector">
      <legend>{locationsPage.upload.analysis}</legend>
      <br />
      {analysisTypesOptions.map(({ id, label }) => (
        <div key={id}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedAnalysis?.includes(id)}
                onChange={() => handleAnalyzesSelection(id)}
              />
            }
            label={label}
          />
        </div>
      ))}
    </FormGroup>
  );
}

export default AnalysisTypesSelector;
