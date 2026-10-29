import { useState } from 'react';
import { Box, ClickAwayListener, Container, Link, Typography } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import LanguageIcon from '@mui/icons-material/Language';
import StorageIcon from '@mui/icons-material/Storage';
import ArticleIcon from '@mui/icons-material/Article';
import EmailIcon from '@mui/icons-material/Email';
import gnwLogo from '../../../assets/icons/gnw-logo.png';
import { SPLASH_LANGUAGES } from '../i18n/splashTranslations';
import { useSplashTranslation } from '../i18n/useSplashTranslation';

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
    text: 'Dashboards for monitoring natural forest loss and more, plus AI-enabled features that help you interpret data, select the right datasets for you and generate custom charts.',
    linkLabel: 'horizon.globalnaturewatch.org →',
    href: GNW_HORIZON_LINK,
    variant: 'primary',
    Icon: PublicIcon,
  },
  {
    kicker: 'Open-source data & programmatic access',
    title: 'Access GNW self-hosted monitoring (SHM) datasets',
    text: "Download and integrate GNW's supply chain-oriented open data directly — tree cover loss, natural forest, integrated forest alerts, GHG emissions and more.",
    linkLabel: 'Access data & documentation →',
    href: GNW_DATA_LINK,
    variant: 'primary',
    Icon: StorageIcon,
  },
  {
    kicker: 'Announcement',
    title: 'Read the full announcement',
    text: "What's changing, what data has migrated and everything you need to know about the transition to GNW.",
    linkLabel: 'Read the announcement →',
    href: BLOG_LINK,
    variant: 'default',
    Icon: ArticleIcon,
  },
  {
    kicker: 'Support',
    title: 'Get help',
    text: 'Get answers to questions about your data, subscriptions and how to get set up on the new platform.',
    linkLabel: 'Submit a support request →',
    href: `mailto:${SUPPORT_EMAIL}`,
    variant: 'default',
    Icon: EmailIcon,
  },
];

const renderCard = (card, t) => (
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
      <card.Icon
        sx={{
          fontSize: 22,
          color: card.variant === 'default' ? 'primary.700' : 'primary.900',
        }}
      />
    </Box>
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        opacity: 0.75,
        mb: 1.5,
      }}
    >
      {t(card.kicker)}
    </Typography>
    <Typography sx={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3, mb: 1 }}>
      {t(card.title)}
    </Typography>
    <Typography sx={{ fontSize: 14, lineHeight: 1.55, opacity: 0.9, mb: 2, flexGrow: 1 }}>
      {t(card.text)}
    </Typography>
    <Link
      href={card.href}
      target={card.href.startsWith('mailto:') ? undefined : '_blank'}
      rel="noopener noreferrer"
      sx={{
        fontSize: 14,
        fontWeight: 600,
        color: card.variant === 'default' ? 'primary.700' : 'inherit',
      }}
    >
      {t(card.linkLabel)}
    </Link>
  </Box>
);

const LANGUAGE_ABBREVIATIONS = { en: 'EN', es: 'ES', pt: 'PT' };

/**
 * Language selector matching the site navbar pattern: a globe-icon button
 * showing the current language code, opening a dropdown of language names.
 */
const LanguageMenu = ({ language, onLanguageChange }) => {
  const [open, setOpen] = useState(false);

  const select = (code) => {
    onLanguageChange(code);
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: 'relative' }}>
        <Box
          component="button"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Change language"
          onClick={() => setOpen((value) => !value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            p: 0.75,
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: 1,
            backgroundColor: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1,
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
          }}
        >
          {LANGUAGE_ABBREVIATIONS[language] || language.toUpperCase()}
          <LanguageIcon sx={{ fontSize: 18 }} />
        </Box>
        {open && (
          <Box
            component="ul"
            role="listbox"
            sx={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              m: 0,
              p: 0.5,
              listStyle: 'none',
              minWidth: 160,
              backgroundColor: 'background.paper',
              color: 'text.primary',
              borderRadius: 1,
              boxShadow: 3,
              zIndex: 10,
            }}
          >
            {SPLASH_LANGUAGES.map((lang) => (
              <Box
                component="li"
                key={lang.code}
                role="option"
                aria-selected={language === lang.code}
                onClick={() => select(lang.code)}
                sx={{
                  px: 1.5,
                  py: 1,
                  fontSize: 14,
                  cursor: 'pointer',
                  borderRadius: 0.5,
                  fontWeight: language === lang.code ? 600 : 400,
                  color: language === lang.code ? 'primary.700' : 'text.primary',
                  backgroundColor: language === lang.code ? 'primary.100' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                {lang.label}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
};

/**
 * Splash page shown after GFW Pro retires (December 31, 2026).
 * Copy/design is provisional — final version TBD.
 */
export default function Splash() {
  const { language, setLanguage, t } = useSplashTranslation();

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
          <Typography sx={{ fontSize: 14, opacity: 0.9, fontWeight: 400 }}>
            {t('Previously GFW Pro')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <LanguageMenu language={language} onLanguageChange={setLanguage} />
          <Link
            href={`mailto:${SUPPORT_EMAIL}`}
            sx={{ fontSize: 14, fontWeight: 500, color: 'inherit', whiteSpace: 'nowrap' }}
          >
            {t('Need help? Contact us →')}
          </Link>
        </Box>
      </Box>

      <Box
        sx={{ backgroundColor: 'primary.100', borderBottom: 1, borderColor: 'primary.200', py: 7 }}
      >
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
            <Box
              component="span"
              sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'error.main' }}
            />
            {t('Product retired · December 31, 2026')}
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 44 }, fontWeight: 700, mb: 2 }}>
            {t('GFW Pro has closed')}
          </Typography>
          <Typography
            sx={{ maxWidth: 640, fontSize: 17, lineHeight: 1.6, color: 'text.secondary' }}
          >
            {t('As part of the')}{' '}
            <Link
              href={BLOG_LINK}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.700', fontWeight: 500 }}
            >
              {t('evolution of Global Forest Watch to Global Nature Watch (GNW)')}
            </Link>
            {t(
              ", we are consolidating our product suite to provide a more unified platform for monitoring and protecting the world's forests and nature. We are also expanding GNW to serve many of the core needs GFW Pro supports today."
            )}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 5 },
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" sx={{ fontSize: 20, fontWeight: 600, mb: 2 }}>
              {t('Explore two pathways')}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2.5,
                flexGrow: 1,
              }}
            >
              {CARDS.slice(0, 2).map((card) => renderCard(card, t))}
            </Box>
          </Box>

          <Box
            sx={{
              alignSelf: 'stretch',
              width: { xs: 'auto', md: '1px' },
              height: { xs: '1px', md: 'auto' },
              backgroundColor: 'neutral.300',
              flexShrink: 0,
            }}
          />

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" sx={{ fontSize: 20, fontWeight: 600, mb: 2 }}>
              {t('Additional resources')}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2.5,
                flexGrow: 1,
              }}
            >
              {CARDS.slice(2).map((card) => renderCard(card, t))}
            </Box>
          </Box>
        </Box>
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
          <Link
            href={PRIVACY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'inherit' }}
          >
            {t('Privacy Policy')}
          </Link>
          <Link
            href={TERMS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'inherit' }}
          >
            {t('Terms of Use')}
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
