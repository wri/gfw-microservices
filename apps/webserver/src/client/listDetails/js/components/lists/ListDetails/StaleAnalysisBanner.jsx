import AlertBanner from './AlertBanner';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { analysisTypes } from '../../../../../../config/env/analysisTypes.constants';

const EXCLUDED_FROM_STALE_CHECK = [analysisTypes.ALERTS];

export function isAnalysisStale(analysis) {
  if (!analysis?.analysisIdLastModifed || !analysis?.updateTime) {
    return false;
  }
  return new Date(analysis.analysisIdLastModifed) > new Date(analysis.updateTime);
}

export function getStaleAnalysisIds(enrichedAnalysisStatuses) {
  if (!enrichedAnalysisStatuses?.length) {
    return [];
  }
  return enrichedAnalysisStatuses
    .filter((a) => !EXCLUDED_FROM_STALE_CHECK.includes(a.analysisId))
    .filter(isAnalysisStale)
    .map(({ analysisId }) => analysisId);
}

export default function StaleAnalysisBanner({ onResubmit }) {
  return (
    <AlertBanner
      title="New data available"
      backgroundColor="#E8F5E9"
      color="#2E7D32"
      borderColor="#4CAF50"
      icon={<AutorenewIcon fontSize="inherit" />}
      message="Updated analysis data is available. Re-submit your list for analysis to see the latest results."
      buttonText="Re-submit"
      buttonTextColor="#2E7D32"
      onButtonClick={onResubmit}
    />
  );
}
