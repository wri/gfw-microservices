import * as React from 'react';
import Alert from '@mui/material/Alert';
import ReportIcon from '@mui/icons-material/Report';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function ErrorBanner({ hasLocationWithErrors, openDraftSubmitDialog }) {
  return (
    hasLocationWithErrors && (
      <Stack
        sx={{ width: '100%', background: '#F24E1E', alignItems: 'center', display: 'flex' }}
        spacing={2}
      >
        <Alert
          className="banner"
          sx={{
            background: '#F24E1E',
            color: '#EEE',
            display: 'flex',
            border: 'black',
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
              <ReportIcon style={{ marginRight: '5px' }} fontSize="inherit" />
              Location errors
            </div>
          }
          severity="error"
          action={
            <Button
              style={{
                background: 'white',
                color: '#F24E1E',
                borderRadius: '20px',
                padding: '10px 20px',
              }}
              size="small"
              onClick={openDraftSubmitDialog}
            >
              Try Again
            </Button>
          }
        >
          Some of your locations have failed analysis. <br /> This means that these locations won’t
          be included in list diagnostic calculations.
        </Alert>
      </Stack>
    )
  );
}
