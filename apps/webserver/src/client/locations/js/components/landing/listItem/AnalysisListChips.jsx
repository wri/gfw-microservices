import React from 'react';
import Chip from '@mui/material/Chip';
import RefreshIcon from '@mui/icons-material/Refresh';
import { analysisTypesLabels } from '../../../../../../config/env/analysisTypes.constants';

function AnalysisListChips({AnalysisID}) {
  return (
    <>
      {Object.keys(AnalysisID).map((analysis) => {
        const icon = AnalysisID[analysis]['Status'] === 1 ? <RefreshIcon /> : '';
        const color = AnalysisID[analysis]['Status'] === 2 ? 'success' : 'default';
        if(analysis !== 'ALERTS'){
          return (
            <Chip
              icon={icon}
              label={analysisTypesLabels[analysis]}
              color={color}
              size="small"
              style={{ height: '17px', marginRight: '10px' }}
            />
          )
        }
      })}
    </>
  );
}

export default AnalysisListChips;