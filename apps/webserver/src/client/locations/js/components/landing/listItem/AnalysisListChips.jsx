import React from 'react';
import Chip from '@mui/material/Chip';
import RefreshIcon from '@mui/icons-material/Refresh';
import { analysisTypesOptions } from '../../../../../../config/env/analysisTypes.constants';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import featureFlags from '../../../../../../utils/general.utils';

function AnalysisListChips({ listAnalysesStatus }) {
  const analysisTypesLabels = (analysis) => {
    return analysisTypesOptions.filter((option) => option.id === analysis)[0].shortLabel;
  };

  return (
    <>
      {featureFlags.isAfiAvailable &&
        listAnalysesStatus.map(({ analysisId, status }) => {
          const analysis_status = status;
          const icon = analysis_status === listStatus.Pending ? <RefreshIcon /> : null;
          let color = analysis_status === listStatus.Active ? 'success' : 'default';
          color = analysis_status === listStatus.Inactive ? 'error' : color;

          return (
            <Chip
              key={analysisId}
              icon={icon}
              label={analysisTypesLabels(analysisId)}
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
