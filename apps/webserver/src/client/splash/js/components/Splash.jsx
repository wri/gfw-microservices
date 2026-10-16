import { Box, Container, Link, Typography } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import StorageIcon from '@mui/icons-material/Storage';
import ArticleIcon from '@mui/icons-material/Article';
import EmailIcon from '@mui/icons-material/Email';
import gnwLogo from '../../../assets/icons/gnw-logo.png';

const BLOG_LINK =
  'https://pro-news.globalforestwatch.org/news-events/gfw-pro-is-consolidating-into-global-nature-watch';
const GNW_HORIZON_LINK = 'https://horizon.globalnaturewatch.org/';
const GNW_DATA_LINK = 'https://globalnaturewatch.org/';
const SUPPORT_EMAIL = 'GFWPROsupport@wri.org';
const PRIVACY_LINK = 'https://www.globalforestwatch.org/privacy-policy';
const TERMS_LINK = 'https://www.globalforestwatch.org/terms-of-use';

const CARDS = [
  {
    kicker: 'Web-based map & monitoring',
    title: 'Go to GNW Horizon (preview mode)',
    text: 'Dashboards for monitoring natural forest loss and more, plus AI-enabled features that help you interpret data, select the right datasets for you, and generate custom charts.',
    linkLabel: 'horizon.globalnaturewatch.org →',
    href: GNW_HORIZON_LINK,
    variant: 'primary',
    Icon: PublicIcon,
  },
  {
    kicker: 'Open-source data & programmatic access',
    title: 'Access GNW self-hosted monitoring (SHM) datasets',
    text: "Download and integrate GNW's supply chain-oriented open data directly — tree cover loss, natural forest, integrated forest alerts, GHG emissions, and more.",
    linkLabel: 'Access data & documentation →',
    href: GNW_DATA_LINK,
    variant: 'primary',
    Icon: StorageIcon,
  },
  {
    kicker: 'Announcement',
    title: 'Read the full announcement',
    text: "What's changing, what data has migrated, and everything you need to know about the transition to GNW.",
    linkLabel: 'Read the announcement →',
    href: BLOG_LINK,
    variant: 'default',
    Icon: ArticleIcon,
  },
  {
    kicker: 'Support',
    title: 'Get help',
    text: 'Questions about your data, subscriptions, or how to get set up on the new platform?',
    linkLabel: 'Submit a support request →',
    href: `mailto:${SUPPORT_EMAIL}`,
    variant: 'default',
    Icon: EmailIcon,
  },
];

/**
 * Splash page shown after GFW Pro retires (December 31, 2026).
 * Copy/design is provisional — final version TBD.
 */
export default function Splash() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        color: 'text.primary',
        fontFamily: "'Fira Sans', sans-serif",
      }}
    >
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          px: 3,
          py: 1.5,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src={gnwLogo}
            alt="Global Nature Watch"
            sx={{ height: 40, width: 'auto', display: 'block' }}
          />
          <Typography sx={{ fontSize: 14, opacity: 0.9, fontWeight: 400 }}>Previously GFW Pro</Typography>
        </Box>
        <Link
          href={`mailto:${SUPPORT_EMAIL}`}
          sx={{ fontSize: 14, fontWeight: 500, color: 'inherit', whiteSpace: 'nowrap' }}
        >
          Need help? Contact us →
        </Link>
      </Box>

      <Box sx={{ backgroundColor: 'primary.100', borderBottom: 1, borderColor: 'primary.200', py: 7 }}>
        <Container maxWidth="lg">
          <Typography
            component="p"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'error.main',
              mb: 1.5,
            }}
          >
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'error.main' }} />
            Product retired · December 31, 2026
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 44 }, fontWeight: 700, mb: 2 }}>
            GFW Pro has closed.
          </Typography>
          <Typography sx={{ maxWidth: 640, fontSize: 17, lineHeight: 1.6, color: 'text.secondary' }}>
            As part of the{' '}
            <Link href={BLOG_LINK} target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.700', fontWeight: 500 }}>
              evolution from Global Forest Watch to Global Nature Watch (GNW)
            </Link>
            , we are consolidating our product suite to provide a more unified platform for monitoring and protecting
            the world's forests and nature. We are also expanding GNW to serve many of the core needs GFW Pro
            supports today.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2.5, py: 5 }}>
        {CARDS.map((card) => (
          <Box
            key={card.title}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: 3,
              borderRadius: 2,
              border: 1,
              borderColor: card.variant === 'default' ? 'neutral.300' : 'primary.main',
              backgroundColor: card.variant === 'default' ? 'background.paper' : 'primary.main',
              color: card.variant === 'default' ? 'text.primary' : 'primary.900',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                backgroundColor: card.variant === 'default' ? 'primary.100' : 'rgba(255, 255, 255, 0.25)',
              }}
            >
              <card.Icon sx={{ fontSize: 22, color: card.variant === 'default' ? 'primary.700' : 'primary.900' }} />
            </Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.75, mb: 1.5 }}>
              {card.kicker}
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3, mb: 1 }}>{card.title}</Typography>
            <Typography sx={{ fontSize: 14, lineHeight: 1.55, opacity: 0.9, mb: 2, flexGrow: 1 }}>{card.text}</Typography>
            <Link
              href={card.href}
              target={card.href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener noreferrer"
              sx={{ fontSize: 14, fontWeight: 600, color: card.variant === 'default' ? 'primary.700' : 'inherit' }}
            >
              {card.linkLabel}
            </Link>
          </Box>
        ))}
      </Container>

      <Box
        component="footer"
        sx={{
          mt: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          px: 3,
          py: 2,
          borderTop: 1,
          borderColor: 'neutral.300',
          fontSize: 13,
          color: 'neutral.600',
        }}
      >
        <span>© 2026 World Resources Institute · Global Nature Watch</span>
        <Box sx={{ display: 'flex', gap: 2.5 }}>
          <Link href={PRIVACY_LINK} target="_blank" rel="noopener noreferrer" sx={{ color: 'inherit' }}>
            Privacy Policy
          </Link>
          <Link href={TERMS_LINK} target="_blank" rel="noopener noreferrer" sx={{ color: 'inherit' }}>
            Terms of Use
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
