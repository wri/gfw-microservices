import * as React from 'react';
import ReportIcon from '@mui/icons-material/Report';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SpeedIcon from '@mui/icons-material/Speed';
import AlertBanner from './AlertBanner';

export default function AnalysisStatusBanners({
  isDiagnosticStatusDraft,
  hasLocationWithErrors,
  openDraftSubmitDialog,
  toggleReRunAnalysisDialog,
  isFailedAnalysis,
  isAnalysisFailedByExceededAnalysisLimit,
  isListSubmittedForAnalysis,
}) {
  const alertsConfig = [
    {
      condition: !isFailedAnalysis && hasLocationWithErrors,
      title: 'Location errors',
      backgroundColor: '#F24E1E',
      icon: <ReportIcon style={{ marginRight: '5px' }} fontSize="inherit" />,
      message: (
        <>
          Some of your locations have failed analysis. <br /> This means that these locations won’t
          be included in list diagnostic calculations.
        </>
      ),
      buttonText: 'Try Again',
      onButtonClick: openDraftSubmitDialog,
    },
    {
      condition: isFailedAnalysis,
      title: 'Analysis has failed',
      backgroundColor: '#F24E1E',
      icon: <ReportIcon style={{ marginRight: '5px' }} fontSize="inherit" />,
      message: <>To receive results, resubmit this list for analysis.</>,
      buttonText: 'Try Again',
      onButtonClick: toggleReRunAnalysisDialog,
    },
    {
      condition: isAnalysisFailedByExceededAnalysisLimit,
      title: 'Usage limit exceeded',
      backgroundColor: '#FFA500',
      icon: <SpeedIcon style={{ marginRight: '5px' }} fontSize="inherit" />,
      message: (
        <>
          This list failed due to usage limits.
          <br />
          To continue parsing your lists, you need to increase the usage limit.
        </>
      ),
      buttonText: 'INCREASE LIMIT',
      onButtonClick: () => (window.location.href = '/profile'),
    },
    {
      condition:
        (isDiagnosticStatusDraft && !isListSubmittedForAnalysis) ||
        isAnalysisFailedByExceededAnalysisLimit,
      title: 'DRAFT',
      backgroundColor: '#58a9cd',
      icon: <EditNoteIcon sx={{ mr: 0.5 }} fontSize="inherit" />,
      message: (
        <>
          Your list is currently in Draft state. To view data for your list, please submit for
          analysis.
        </>
      ),
      buttonText: 'Submit for Analysis',
      onButtonClick: openDraftSubmitDialog,
    },
  ];

  return (
    <>
      {alertsConfig.map(
        (alert, index) =>
          alert.condition && (
            <React.Fragment key={index}>
              <AlertBanner {...alert} />
            </React.Fragment>
          )
      )}
    </>
  );
}
