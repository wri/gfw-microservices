import { useState } from 'react';
import { Alert, IconButton, Link, Typography } from '@mui/material';
import { Close, InfoOutlined } from '@mui/icons-material';

const BLOG_LINK =
  'https://pro-news.globalforestwatch.org/news-events/gfw-pro-is-consolidating-into-global-nature-watch';
const GNW_LINK = 'https://horizon.globalnaturewatch.org/';
const CONTACT_LINK =
  'https://gfwpro.zendesk.com/hc/en-us/requests/new?ticket_form_id=30920711977363';

export default function AccountRequestBanner({ dismissible = false, mb = 2 }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <Alert
      severity="info"
      iconMapping={{ info: <InfoOutlined sx={{ fontSize: 20 }} /> }}
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
      <Typography variant="body2" sx={{ mb: 0.75 }}>
        As part of the evolution from Global Forest Watch into Global Nature Watch, we are
        consolidating our product suite and GFW Pro will retire on December 31, 2026. We recommend
        new users explore the alternatives now available for free across WRI:{' '}
        <Link href={GNW_LINK} target="_blank" rel="noopener noreferrer" fontWeight={500}>
          GNW Horizon
        </Link>
        , our AI-enhanced, next-generation monitoring experience in preview, and our self-hosted
        monitoring datasets for direct access and integration into your internal systems. To learn
        more, read our{' '}
        <Link href={BLOG_LINK} target="_blank" rel="noopener noreferrer">
          blog post
        </Link>{' '}
        outlining these alternatives for those considering GFW Pro or the GFW Pro API.
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.75 }}>
        If those tools meet your needs, we encourage you to start there rather than requesting a GFW
        Pro account.
      </Typography>
      <Typography variant="body2">
        Please only submit this request if you have a specific, time-bound need for GFW Pro's
        capabilities that the alternatives cannot address, or if you need to cross-check GFW Pro
        metrics directly ahead of the platform's retirement. If so, please submit your request and{' '}
        <Link href={CONTACT_LINK} target="_blank" rel="noopener noreferrer">
          contact our team directly
        </Link>{' '}
        right away. We are only able to move account requests forward when we hear from you
        directly.
      </Typography>
    </Alert>
  );
}
