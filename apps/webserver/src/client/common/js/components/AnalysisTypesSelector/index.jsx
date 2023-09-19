import React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { locationsPage } from '../../config';
import { analysisTypesOptions } from '../../../../../config/env/analysisTypes.constants';
import './AnalysisTypesSelector.scss';

function AnalysisTypesSelector({ selectedAnalyses, setSelectedAnalyses }) {
  const handleAnalyzesSelection = (selectedAnalysisId) => {
    let selection;
    if (selectedAnalyses.includes(selectedAnalysisId)) {
      selection = selectedAnalyses.filter((selectedType) => selectedType !== selectedAnalysisId);
    } else {
      selection = [...selectedAnalyses, selectedAnalysisId];
    }
    setSelectedAnalyses(selection);
  };

  return (
    <FormGroup className="analysis-types-selector">
      <legend>{locationsPage.upload.analysis}</legend>
      <br />
      {analysisTypesOptions.map(({ id, label }) => (
        <div key={id}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedAnalyses.includes(id)}
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
