import { listStatus } from '../../../../config/env/listStatuses.constants';
import { formatDateForCurrentBrowserLanguage } from '../../../common/js/utils/format';

const getAnalysisAvailabilityMessage = (listAnalysesStatus, isLegacyAnalysis = false) => {
  const { Pending, Draft } = listStatus;
  const analysisId = new URLSearchParams(location.search).get('type');

  const currentAnalysis = listAnalysesStatus?.find((item) => item.analysisId === analysisId);
  const statusId = currentAnalysis?.status;
  const updateTime = currentAnalysis?.updateTime;
  const isListBeingAnalyzed = statusId === Pending;

  const formattedUpdateTime = formatDateForCurrentBrowserLanguage(updateTime);
  const messagesMap = {
    [Pending]:
      'List is analyzing. You will receive an email once analysis is complete and can reload the page to access the diagnostics.',
    [Draft]: `Your list is currently in Draft state, which means that it may have been modified since analysis was last run. The diagnostics shown here don’t reflect any changes that were made since last analysis. Re-submit your list for analysis to update the diagnostics shown here. Analysis updated: ${formattedUpdateTime}`,
  };

  let message;
  if (isLegacyAnalysis) {
    message =
      'Your list is out of date. This means that some Argentina-specific data will not display and Argentina-specific files will not be included when downloading CSV files. Please update the analysis on this list to access complete Argentina data.';
  } else {
    message = messagesMap[statusId];
  }

  const DiagnosticsStatusMessage = message && (
    <h4 style={{ color: '#ed1846', padding: '50px 300px', textAlign: 'center' }}>{message}</h4>
  );

  return { DiagnosticsStatusMessage, isListBeingAnalyzed };
};

export default getAnalysisAvailabilityMessage;
