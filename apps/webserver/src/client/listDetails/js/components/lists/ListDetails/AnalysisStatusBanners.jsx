import { Fragment } from 'react';
import { useTheme } from '@mui/material';
import {
  EditNote as EditNoteIcon,
  Report as ReportIcon,
  Speed as SpeedIcon,
  Warning,
} from '@mui/icons-material';

import AlertBanner from './AlertBanner';
import { ExternalLinks } from '../../../../../utils/constants';

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
      icon: <ReportIcon fontSize="inherit" />,
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
      icon: <ReportIcon fontSize="inherit" />,
      message: (
        <>
          Your list has failed analysis. Read more about how to avoid and address analysis failures{' '}
          <a
            href={ExternalLinks.HowToAddressErrorsInUpload}
            target="_blank"
            style={{ textDecoration: 'underline' }}
          >
            here
          </a>
          .
        </>
      ),
      buttonText: 'Try Again',
      buttonTextColor: theme.palette.error.main,
      onButtonClick: toggleReRunAnalysisDialog,
    },
    {
      condition: isAnalysisFailedByExceededAnalysisLimit,
      title: 'Usage limit exceeded',
      backgroundColor: theme.palette.warning.main,
      color: theme.palette.text.primary,
      icon: <SpeedIcon fontSize="inherit" />,
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
      icon: <EditNoteIcon fontSize="inherit" />,
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
      title: 'Draft - Location Errors Detected',
      backgroundColor: theme.palette.secondary.light,
      color: theme.palette.text.primary,
      icon: <Warning sx={{ color: theme.palette.secondary.main }} fontSize="inherit" />,
      message: (
        <>
          This list is in Draft because it includes locations with errors. Location errors can be
          corrected offline and re-added to your list. See more detailed instructions below.
        </>
      ),
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
