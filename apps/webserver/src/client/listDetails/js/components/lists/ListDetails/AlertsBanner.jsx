import * as React from 'react';
import Alert from '@mui/material/Alert';
import ReportIcon from '@mui/icons-material/Report';
import EditNoteIcon from '@mui/icons-material/EditNote';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function AlertsBanner({
  isDiagnosticStatusDraft,
  hasLocationWithErrors,
  openDraftSubmitDialog,
}) {
  const renderAlert = ({ title, backgroundColor, icon, message, buttonText, onButtonClick }) => (
    <Stack
      sx={{ width: '100%', backgroundColor, alignItems: 'center', display: 'flex' }}
      spacing={2}
    >
      <Alert
        className="banner"
        sx={{
          backgroundColor,
          color: '#EEE',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px 45px',
        }}
        icon={
          <div
            style={{
              color: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {icon}
            {title}
          </div>
        }
        severity="error"
        action={
          <Button
            style={{
              background: 'white',
              color: backgroundColor,
              borderRadius: '20px',
              padding: '10px 20px',
            }}
            size="small"
            onClick={onButtonClick}
            aria-label={buttonText}
          >
            {buttonText}
          </Button>
        }
      >
        {message}
      </Alert>
    </Stack>
  );

  return (
    <>
      {hasLocationWithErrors &&
        renderAlert({
          title: 'Location errors',
          backgroundColor: '#F24E1E',
          icon: <ReportIcon style={{ marginRight: '5px' }} fontSize="inherit" />,
          message: (
            <>
              Some of your locations have failed analysis. <br /> This means that these locations
              won’t be included in list diagnostic calculations.
            </>
          ),
          buttonText: 'Try Again',
          onButtonClick: openDraftSubmitDialog,
        })}

      {isDiagnosticStatusDraft &&
        renderAlert({
          title: 'DRAFT',
          backgroundColor: '#58a9cd',
          icon: <EditNoteIcon style={{ marginRight: '5px' }} fontSize="inherit" />,
          message: (
            <>
              Your list is currently in Draft state. To view data for your list, please submit for
              analysis.
            </>
          ),
          buttonText: 'Submit for Analysis',
          onButtonClick: openDraftSubmitDialog,
        })}
    </>
  );
}
