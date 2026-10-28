import { useState } from 'react';
import { Alert, AlertTitle, IconButton, Link, Typography } from '@mui/material';
import { Campaign, Close } from '@mui/icons-material';
import { useTransifexTranslation } from '../../../../hooks/useTransifexTranslation';

const BLOG_LINK =
  'https://pro-news.globalforestwatch.org/news-events/gfw-pro-is-consolidating-into-global-nature-watch';
const EXPORT_LINK = 'https://globalnaturewatch.org/help/gfw-pro/guides/share-receive-export-lists/';

export default function RetirementBanner({ dismissible = false, mb = 2 }) {
  const [dismissed, setDismissed] = useState(false);

  const tTitle = useTransifexTranslation(
    'New ways forward as GFW Pro retires on December 31, 2026'
  );
  const tIntro = useTransifexTranslation(
    'As part of the evolution from Global Forest Watch into Global Nature Watch, we are consolidating our product suite and GFW Pro, including both the web interface and the API, will retire on December 31, 2026. Global Nature Watch offers two transition paths.'
  );
  const tUsing = useTransifexTranslation('Using or considering GFW Pro today? Read the');
  const tBlogPost = useTransifexTranslation(
    'Please read our blog post to learn more about these transition paths.'
  );
  const tTransitionGuidance = useTransifexTranslation('transition guidance');
  const tAnd = useTransifexTranslation('and');
  const tExportData = useTransifexTranslation('export your data.');
  const tBothPaths = useTransifexTranslation('Both paths are self-service.');
  const tNewAccountRequests = useTransifexTranslation(
    'Please note, we will not accept requests for new accounts after November 2nd.'
  );

  if (dismissed) {
    return null;
  }

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
            aria-label="Dismiss retirement banner"
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
          {tTitle}
        </Typography>
      </AlertTitle>
      <Typography variant="body2">{tIntro}</Typography>
      <Link href={BLOG_LINK} target="_blank" rel="noopener noreferrer">
        {tBlogPost}
      </Link>{' '}
      <Typography variant="body2" sx={{ mt: 0.75 }}>
        {tUsing}{' '}
        <Link href={BLOG_LINK} target="_blank" rel="noopener noreferrer">
          {tTransitionGuidance}
        </Link>{' '}
        {tAnd}{' '}
        <Link href={EXPORT_LINK} target="_blank" rel="noopener noreferrer">
          {tExportData}
        </Link>{' '}
        {tBothPaths} {tNewAccountRequests}
      </Typography>
    </Alert>
  );
}
