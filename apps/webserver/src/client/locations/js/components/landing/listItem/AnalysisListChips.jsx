import Chip from '@mui/material/Chip';
import RefreshIcon from '@mui/icons-material/Refresh';
import { analysisTypesOptionsNewNames } from '../../../../../../config/env/analysisTypes.constants';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import '../../../../css/analysisChips.scss';

function AnalysisListChips({ listAnalysesStatus = [] }) {
  const analysisTypesLabels = (analysis) => {
    return analysisTypesOptionsNewNames.filter((option) => option.id === analysis)?.[0]?.shortLabel;
  };

  return (
    <div className="analysis-chips">
      {listAnalysesStatus
        .filter(({ analysisId }) => analysisTypesLabels(analysisId))
        .map(({ analysisId, status }) => {
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
    </div>
  );
}

export default AnalysisListChips;
