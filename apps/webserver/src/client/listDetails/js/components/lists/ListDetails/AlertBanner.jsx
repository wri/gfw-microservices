import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

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
}
