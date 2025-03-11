import React from 'react';
import { listStatus } from '../../../../config/env/listStatuses.constants';

const getAnalysisAvailabilityMessage = (listStatusId, listAnalysesStatus) => {
  const { Pending, Draft } = listStatus;

  const analysisId = new URLSearchParams(location.search).get('type');

  const currentAnalysis = listAnalysesStatus?.find((item) => item.analysisId === analysisId);

  const updateTime = currentAnalysis?.updateTime;

  const isListBeingAnalyzed = listStatusId === Pending;

  const formatedUpdateTime = new Date(updateTime).toLocaleString();
  const messages = {
    [Pending]:
      'List is analyzing. You will receive an email once analysis is complete and can reload the page to access the diagnostics.',
    [Draft]: `Your list is currently in Draft state, which means that it may have been modified since analysis was last run. The diagnostics shown here don’t reflect any changes that were made since last analysis. Re-submit your list for analysis to update the diagnostics shown here. Analysis updated: ${formatedUpdateTime}`,
  };
  const message = messages[listStatusId];

  const DiagnosticsStatusMessage = message && (
    <h4 style={{ color: '#ed1846', padding: '50px 300px', textAlign: 'center' }}>{message}</h4>
  );

  return { DiagnosticsStatusMessage, isListBeingAnalyzed };
};

export default getAnalysisAvailabilityMessage;
