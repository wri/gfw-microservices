import { Alert, Box, Stack, Typography } from '@mui/material';
import { PillButton } from '../../../../../components';

export default function AlertBanner({
  title,
  backgroundColor,
  color,
  icon,
  message,
  buttonText,
  buttonTextColor,
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
          color,
          display: 'flex',
          alignItems: 'center',
          py: 1,
          maxWidth: '1200px',
        }}
        icon={
          <Box
            sx={{
              color,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {icon}
            {title}
          </Box>
        }
        severity="error"
        action={
          <PillButton
            style={{
              background: 'white',
              color: buttonTextColor,
              borderRadius: '20px',
              padding: '10px 20px',
              width: '220px',
            }}
            size="small"
            onClick={onButtonClick}
            aria-label={buttonText}
          >
            {buttonText}
          </PillButton>
        }
      >
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {message}
        </Typography>
      </Alert>
    </Stack>
  );
}
