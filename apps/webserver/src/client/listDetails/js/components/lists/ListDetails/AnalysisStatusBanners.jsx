import { useTheme } from '@mui/material';
import { EditNote, Report, Warning, Error } from '@mui/icons-material';
import AlertBanner from './AlertBanner';
import { ExternalLinks } from '../../../../../utils/constants';

export default function AnalysisStatusBanners(props) {
  const {
    isDiagnosticStatusDraft,
    hasLocationWithErrors,
    openDraftSubmitDialog,
    toggleReRunAnalysisDialog,
    isFailedAnalysis,
    isAnalysisFailedByExceededAnalysisLimit,
    isListSubmittedForAnalysis,
    isListWithErrors,
    isOnlyGHGActive,
  } = props;

  const theme = useTheme();

  const COLORS = {
    error: theme.palette.error.main,
    errorLight: theme.palette.error[100],
    errorBorder: theme.palette.error[500],
    errorContrastText: theme.palette.error[700],
    secondary: theme.palette.secondary.main,
    secondaryContrastText: theme.palette.secondary.contrastText,
    secondaryLight: theme.palette.secondary.light,
    secondaryDark: theme.palette.secondary.dark,
    warning: theme.palette.warning.main,
    warningLight: theme.palette.warning[100],
    warningBorder: theme.palette.warning[500],
    warningContrastText: theme.palette.warning[700],
  };

  const ALERT_DEFS = {
    locationErrors: {
      title: 'Location Errors',
      backgroundColor: COLORS.errorLight,
      color: COLORS.errorContrastText,
      icon: <Error fontSize="inherit" />,
      message: (
        <>
          Some of your locations have failed analysis. <br />
          This means that these locations won't be included in list diagnostic calculations.
        </>
      ),
      buttonText: 'Try Again',
      buttonTextColor: theme.palette.text.primary,
      borderColor: COLORS.errorBorder,
      onButtonClick: openDraftSubmitDialog,
    },

    analysisFailed: {
      title: 'Analysis has failed',
      backgroundColor: COLORS.errorLight,
      color: COLORS.errorContrastText,
      icon: <Report fontSize="inherit" />,
      message: (
        <>
          Your list has failed analysis. Read more about how to avoid and address analysis failures{' '}
          <a
            href={ExternalLinks.HowToAddressErrorsInUpload}
            target="_blank"
            style={{
              textDecoration: 'underline',
              color: COLORS.errorContrastText,
            }}
          >
            here
          </a>
          .
        </>
      ),
      buttonText: 'Try Again',
      buttonTextColor: theme.palette.text.primary,
      borderColor: COLORS.errorBorder,
      onButtonClick: toggleReRunAnalysisDialog,
    },

    limitExceeded: {
      title: 'Usage limit exceeded',
      backgroundColor: COLORS.errorLight,
      color: COLORS.errorContrastText,
      icon: <Error fontSize="inherit" />,
      message: (
        <>
          This list was not processed because it would have exceeded your organization&apos;s
          current usage limits. Contact our team to increase limits. After limits have been
          increased, click &quot;submit for analysis&quot; to retry.
        </>
      ),
      buttonText: 'Increase limit',
      buttonTextColor: theme.palette.text.primary,
      borderColor: COLORS.errorBorder,
      onButtonClick: () => (window.location.href = '/profile'),
    },

    draft: {
      title: 'Draft',
      backgroundColor: COLORS.secondaryLight,
      color: COLORS.secondaryContrastText,
      icon: <EditNote fontSize="inherit" />,
      message: (
        <>
          Your list is currently in Draft state. To view data for your list, please submit for
          analysis.
        </>
      ),
      buttonText: 'Submit Again',
      buttonTextColor: theme.palette.text.primary,
      borderColor: COLORS.secondaryDark,
      onButtonClick: openDraftSubmitDialog,
    },

    draftWithErrors: {
      title: 'Draft - Location Errors Detected',
      backgroundColor: COLORS.secondaryLight,
      color: COLORS.secondaryContrastText,
      icon: <Warning sx={{ color: COLORS.secondary }} fontSize="inherit" />,
      message: (
        <>
          This list is in Draft because it includes locations with errors. Location errors can be
          corrected offline and re-added to your list. See more detailed instructions below.
        </>
      ),
      borderColor: COLORS.secondaryDark,
    },
  };

  function getAlertKey() {
    if (!isFailedAnalysis && hasLocationWithErrors) {
      return 'locationErrors';
    }
    if (isFailedAnalysis) {
      return 'analysisFailed';
    }
    if (isAnalysisFailedByExceededAnalysisLimit) {
      return 'limitExceeded';
    }
    if (
      !isListWithErrors &&
      !isOnlyGHGActive &&
      ((isDiagnosticStatusDraft && !isListSubmittedForAnalysis) ||
        isAnalysisFailedByExceededAnalysisLimit)
    ) {
      return 'draft';
    }
    if (isListWithErrors && isDiagnosticStatusDraft) {
      return 'draftWithErrors';
    }

    return null;
  }

  const alertKey = getAlertKey();

  if (!alertKey) {
    return null;
  }

  return <AlertBanner {...ALERT_DEFS[alertKey]} />;
}
