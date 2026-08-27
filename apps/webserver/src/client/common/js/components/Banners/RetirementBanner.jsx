import { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import { Campaign, Close } from '@mui/icons-material';

export default function RetirementBanner({ dismissible = false, mb = 2 }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Alert
      severity="info"
      iconMapping={{ info: <Campaign sx={{ fontSize: 20 }} /> }}
      action={
        dismissible ? (
          <IconButton
            onClick={() => setDismissed(true)}
            disableRipple
            size="small"
          >
            <Close sx={{ color: (theme) => theme.palette.text.primary, fontSize: 16 }} />
          </IconButton>
        ) : null
      }
      sx={{
        position: 'relative',
        zIndex: 1,
        borderRadius: 1.5,
        mb,
        border: (theme) => `1px solid ${theme.palette.secondary[300]}`,
        backgroundColor: (theme) => theme.palette.secondary[100],
        color: (theme) => theme.palette.secondary[900],
        '& svg': { color: (theme) => theme.palette.secondary[700] },
      }}
    >
      <AlertTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ fontWeight: 500, flexGrow: 1 }}>
          New ways forward as GFW Pro retires by early 2027
        </Typography>
      </AlertTitle>
      <Typography variant="body2" sx={{ mb: 0.75 }}>
        GFW Pro, including both the web interface and the API, will retire by the first quarter of
        2027. Global Nature Watch offers two transition paths:
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 0.75, listStyleType: 'disc' }}>
        <Box component="li" sx={{ mb: 0.5, display: 'list-item' }}>
          <Typography variant="body2" component="span">
            <Link
              href="https://horizon.globalnaturewatch.org/"
              target="_blank"
              rel="noopener noreferrer"
              fontWeight={500}
            >
              GNW Horizon
            </Link>
            : Available in preview now, free browser-based monitoring with no GIS staff or
            infrastructure needed. Post-2020 risk assessment and alerts coming in months ahead.
          </Typography>
        </Box>
        <Box component="li" sx={{ display: 'list-item' }}>
          <Typography variant="body2" component="span">
            <strong>Self-hosted monitoring</strong>: Available now, free and open datasets and
            scripts for higher volume use cases and integration into your own applications.
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2">
        Using or considering GFW Pro today? Start planning your transition{' '}
        <Link
          href="https://blog.globalnaturewatch.org/gfw-pro-retirement"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </Link>
        .
      </Typography>
    </Alert>
  );
}
