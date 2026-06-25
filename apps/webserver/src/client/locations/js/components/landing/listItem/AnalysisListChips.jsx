import Chip from '@mui/material/Chip';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  analysisTypes,
  analysisTypesOptionsNewNames,
  weeklyAlertsAnalysis,
  AlertsAnalysisFrequency,
} from '../../../../../../config/env/analysisTypes.constants';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import '../../../../css/analysisChips.scss';

function AnalysisListChips({ listAnalysesStatus = [] }) {
  const allAnalysisLabels = [...analysisTypesOptionsNewNames, weeklyAlertsAnalysis];

  const getShortLabel = (analysisId) => {
    return allAnalysisLabels.find((option) => option.id === analysisId)?.shortLabel;
  };

  // Synthesize a Weekly entry when the ALERTS row has options='Weekly',
  // but only if a Weekly row is not already present in the data (e.g. from
  // resolveListAnalysisStatuses) to avoid duplicate chips and React key collisions.
  const hasWeeklyEntry = listAnalysesStatus.some(
    (a) => a.analysisId === AlertsAnalysisFrequency.WEEKLY
  );
  const entries = listAnalysesStatus.flatMap((entry) => {
    const items = [entry];
    if (
      !hasWeeklyEntry &&
      entry.analysisId === analysisTypes.ALERTS &&
      entry.options === AlertsAnalysisFrequency.WEEKLY
    ) {
      items.push({ analysisId: AlertsAnalysisFrequency.WEEKLY, status: entry.status });
    }
    return items;
  });

  return (
    <div className="analysis-chips">
      {entries
        .filter(({ analysisId }) => getShortLabel(analysisId))
        .map(({ analysisId, status }) => {
          const analysis_status = status;
          const icon = analysis_status === listStatus.Pending ? <RefreshIcon /> : null;
          let color = analysis_status === listStatus.Active ? 'success' : 'default';
          color = analysis_status === listStatus.Inactive ? 'error' : color;
          return (
            <Chip
              key={analysisId}
              icon={icon}
              label={getShortLabel(analysisId)}
              color={color}
              size="small"
            />
          );
        })}
    </div>
  );
}

export default AnalysisListChips;
