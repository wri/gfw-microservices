import AlertBanner from './AlertBanner';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { analysisTypes } from '../../../../../../config/env/analysisTypes.constants';
import { useTransifexTranslation } from '../../../../../hooks/useTransifexTranslation';

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
  const title = useTransifexTranslation('New data available');
  const message = useTransifexTranslation(
    'Updated analysis data is available. Re-submit your list for analysis to see the latest results.'
  );
  const buttonText = useTransifexTranslation('Re-submit');

  return (
    <AlertBanner
      title={title}
      backgroundColor="#E8F5E9"
      color="#2E7D32"
      borderColor="#4CAF50"
      icon={<AutorenewIcon fontSize="inherit" />}
      message={message}
      buttonText={buttonText}
      buttonTextColor="#2E7D32"
      onButtonClick={onResubmit}
    />
  );
}
