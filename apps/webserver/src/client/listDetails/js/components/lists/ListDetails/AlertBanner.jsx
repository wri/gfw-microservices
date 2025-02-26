import * as React from 'react';
import { Alert, Button, Stack } from '@mui/material';

export default function AlertBanner({
  title,
  backgroundColor,
  icon,
  message,
  buttonText,
  onButtonClick,
}) {
  return (
    <Stack
      sx={{ width: '100%', backgroundColor, alignItems: 'center', display: 'flex' }}
      spacing={2}
    >
      <Alert
        sx={{
          backgroundColor,
          color: '#EEE',
          display: 'flex',
          alignItems: 'center',
          py: 1,
          maxWidth: '1200px',
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
              width: '200px',
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
}
