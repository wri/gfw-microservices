import { Alert, IconButton, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';

export const EUDR_BANNER_KEY = 'GFW-is-eudr-banner-dismissed';

const bannerSx = {
  borderRadius: 1,
  mb: 2,
  alignItems: 'center',
  border: (theme) => `1px solid ${theme.palette.secondary[300]}`,
  backgroundColor: (theme) => theme.palette.secondary[100],
  color: (theme) => theme.palette.secondary[900],
  '& svg': {
    color: (theme) => theme.palette.secondary[700],
  },
  '& .MuiAlert-message': {
    display: 'flex',
    gap: 0.5,
  },
};

export default function EudrBanner({ onDismiss }) {
  return (
    <Alert
      severity="info"
      action={
        <IconButton
          onClick={() => {
            localStorage.setItem(EUDR_BANNER_KEY, 1);
            onDismiss();
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      }
      sx={bannerSx}
    >
      <Typography variant="body1" sx={{ fontWeight: '500' }}>
        Looking for EUDR-related analyses?
      </Typography>
      <Typography variant="body1">
        The Post-2020 Risk Assessment is recommended to support EUDR compliance.
      </Typography>
    </Alert>
  );
}
