import { Alert, IconButton, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';
import { Link } from '../../../../../components';
import { ExternalLinks, ReusableText } from '../../../../../utils/constants';

export const ALERTS_UNSUBSCRIBE_BANNER_KEY = 'GFW-is-alerts-unsubscribe-banner-dismissed';

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
};

export default function AlertsUnsubscribeBanner({ onDismiss }) {
  return (
    <Alert
      severity="info"
      action={
        <IconButton
          onClick={() => {
            localStorage.setItem(ALERTS_UNSUBSCRIBE_BANNER_KEY, 1);
            onDismiss();
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      }
      sx={bannerSx}
    >
      <Typography variant="body1">
        {ReusableText.AlertsUnsubscribeNotice}{' '}
        <Link href={ExternalLinks.UploadFees} target="_blank" rel="noopener noreferrer">
          See more information here.
        </Link>
      </Typography>
    </Alert>
  );
}
