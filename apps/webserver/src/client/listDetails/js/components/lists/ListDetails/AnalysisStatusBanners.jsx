import { Fragment } from 'react';
import ReportIcon from '@mui/icons-material/Report';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SpeedIcon from '@mui/icons-material/Speed';
import AlertBanner from './AlertBanner';

import { useTheme } from '@mui/material';

export default function AnalysisStatusBanners({
  isDiagnosticStatusDraft,
  hasLocationWithErrors,
  openDraftSubmitDialog,
  toggleReRunAnalysisDialog,
  isFailedAnalysis,
  isAnalysisFailedByExceededAnalysisLimit,
  isListSubmittedForAnalysis,
  isListWithErrors,
  isOnlyGHGActive,
}) {
  const theme = useTheme();

  const alertsConfig = [
    {
      condition: !isFailedAnalysis && hasLocationWithErrors,
      title: 'Location errors',
      backgroundColor: theme.palette.error.main,
      color: '#EEE',
      icon: <ReportIcon style={{ marginRight: '5px' }} fontSize="inherit" />,
      message: (
        <>
          Some of your locations have failed analysis. <br /> This means that these locations won't
          be included in list diagnostic calculations.
        </>
      ),
      buttonText: 'Try Again',
      buttonTextColor: theme.palette.error.main,
      onButtonClick: openDraftSubmitDialog,
    },
    {
      condition: isFailedAnalysis,
      title: 'Analysis has failed',
      backgroundColor: theme.palette.error.main,
      color: '#EEE',
      icon: <ReportIcon style={{ marginRight: '5px' }} fontSize="inherit" />,
      message: <>To receive results, resubmit this list for analysis.</>,
      buttonText: 'Try Again',
      buttonTextColor: theme.palette.error.main,
      onButtonClick: toggleReRunAnalysisDialog,
    },
    {
      condition: isAnalysisFailedByExceededAnalysisLimit,
      title: 'Usage limit exceeded',
      backgroundColor: theme.palette.warning.main,
      color: theme.palette.text.primary,
      icon: <SpeedIcon style={{ marginRight: '5px' }} fontSize="inherit" />,
      message: (
        <>
          This list failed due to usage limits.
          <br />
          To continue parsing your lists, you need to increase the usage limit.
        </>
      ),
      buttonText: 'Increase limit',
      buttonTextColor: theme.palette.text.primary,
      onButtonClick: () => (window.location.href = '/profile'),
    },
    {
      condition:
        !isListWithErrors &&
        !isOnlyGHGActive &&
        ((isDiagnosticStatusDraft && !isListSubmittedForAnalysis) ||
          isAnalysisFailedByExceededAnalysisLimit),
      title: 'DRAFT',
      backgroundColor: theme.palette.secondary.main,
      color: '#EEE',
      icon: <EditNoteIcon sx={{ mr: 0.5 }} fontSize="inherit" />,
      message: (
        <>
          Your list is currently in Draft state. To view data for your list, please submit for
          analysis.
        </>
      ),
      buttonText: 'Submit for Analysis',
      buttonTextColor: theme.palette.secondary.main,
      onButtonClick: openDraftSubmitDialog,
    },
    {
      condition: isListWithErrors && isDiagnosticStatusDraft,
      title: 'DRAFT',
      backgroundColor: theme.palette.warning.main,
      color: theme.palette.text.primary,
      icon: <EditNoteIcon sx={{ mr: 0.5 }} fontSize="inherit" />,
      message: (
        <>
          Your list is in Draft state because there are errors in your locations. Hover over your
          locations with errors to understand why they failed. After fixing them offline, you can
          re-upload them and add them to this list once again for submission.
        </>
      ),
      buttonText: 'Submit for Analysis',
      buttonTextColor: theme.palette.text.primary,
      onButtonClick: openDraftSubmitDialog,
    },
  ];

  return (
    <>
      {alertsConfig.map(
        (alert, index) =>
          alert.condition && (
            <Fragment key={index}>
              <AlertBanner {...alert} />
            </Fragment>
          )
      )}
    </>
  );
}
