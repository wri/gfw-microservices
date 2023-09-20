import React from 'react';
import Chip from '@mui/material/Chip';
import RefreshIcon from '@mui/icons-material/Refresh';
import { analysisTypesOptions } from '../../../../../../config/env/analysisTypes.constants';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import featureFlags from '../../../../../../utils/general.utils';

function AnalysisListChips({ AnalysisID }) {
  const analysisTypesLabels = (analysis) => {
    return analysisTypesOptions.filter((option) => option.id === analysis)[0].shortLabel;
  };

  return (
    <>
      {featureFlags.isEudrAvailable &&
        Object.keys(AnalysisID).map((analysis) => {
          const analysis_status = AnalysisID[analysis]['Status'];
          const icon = analysis_status === listStatus.Pending ? <RefreshIcon /> : '';
          let color = analysis_status === listStatus.Active ? 'success' : 'default';
          color = analysis_status === listStatus.Inactive ? 'error' : color;

          return (
            <Chip
              icon={icon}
              label={analysisTypesLabels(analysis)}
              color={color}
              size="small"
              style={{ height: '17px', marginRight: '10px' }}
            />
          );
        })}
    </>
  );
}

export default AnalysisListChips;
