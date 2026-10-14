import { useState } from 'react';
import { Alert, AlertTitle, Box, IconButton, Link, Typography } from '@mui/material';
import { Campaign, Close } from '@mui/icons-material';
import { useTransifexTranslation } from '../../../../hooks/useTransifexTranslation';

const BLOG_LINK =
  'https://pro-news.globalforestwatch.org/news-events/gfw-pro-is-consolidating-into-global-nature-watch';
const GNW_LINK = 'https://horizon.globalnaturewatch.org/';
const EXPORT_LINK = 'https://globalnaturewatch.org/help/gfw-pro/guides/share-receive-export-lists/';

export default function RetirementBanner({ dismissible = false, mb = 2 }) {
  const [dismissed, setDismissed] = useState(false);

  const tTitle = useTransifexTranslation('New ways forward as GFW Pro retires on December 31, 2026');
  const tIntro = useTransifexTranslation(
    'As part of the evolution from Global Forest Watch into Global Nature Watch, we are consolidating our product suite and GFW Pro, including both the web interface and the API, will retire on December 31, 2026. Global Nature Watch offers two transition paths:'
  );
  const tSelfHosted = useTransifexTranslation('Self-hosted monitoring');
  const tSelfHostedDesc = useTransifexTranslation(
    ': Available now. Open datasets and scripts that reproduce GFW Pro’s Post-2020 Risk Assessment and Recent Disturbance Alerts on your own infrastructure. Requires GIS or data engineering capacity. Your technical team can start today.'
  );
  const tHorizonDesc = useTransifexTranslation(
    ': Available in preview now, free browser-based monitoring with no GIS staff or infrastructure needed. EUDR- and AFi-aligned reporting dashboards coming in months ahead.'
  );
  const tUsing = useTransifexTranslation('Using or considering GFW Pro today? Read the');
  const tTransitionGuidance = useTransifexTranslation('transition guidance');
  const tAnd = useTransifexTranslation('and');
  const tExportData = useTransifexTranslation('export your data');
  const tBothPaths = useTransifexTranslation('. Both paths are self-service.');

  if (dismissed) {
    return null;
  }

  return (
    <Alert
      severity="info"
      iconMapping={{ info: <Campaign sx={{ fontSize: 20 }} /> }}
      action={
        dismissible ? (
          <IconButton onClick={() => setDismissed(true)} disableRipple size="small">
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
          {tTitle}
        </Typography>
      </AlertTitle>
      <Typography variant="body2" sx={{ mb: 0.75 }}>
        {tIntro}
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 0.75, listStyleType: 'disc' }}>
        <Box component="li" sx={{ display: 'list-item' }}>
          <Typography variant="body2" component="span">
            <strong>{tSelfHosted}</strong>
            {tSelfHostedDesc}
          </Typography>
        </Box>
        <Box component="li" sx={{ mb: 0.5, display: 'list-item' }}>
          <Typography variant="body2" component="span">
            <Link href={GNW_LINK} target="_blank" rel="noopener noreferrer" fontWeight={500}>
              GNW Horizon
            </Link>
            {tHorizonDesc}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2">
        {tUsing}{' '}
        <Link href={BLOG_LINK} target="_blank" rel="noopener noreferrer">
          {tTransitionGuidance}
        </Link>{' '}
        {tAnd}{' '}
        <Link href={EXPORT_LINK} target="_blank" rel="noopener noreferrer">
          {tExportData}
        </Link>
        {tBothPaths}
      </Typography>
    </Alert>
  );
}
