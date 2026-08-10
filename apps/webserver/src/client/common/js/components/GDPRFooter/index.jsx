import './GDPRFooter.scss';
import { privacyPolicy, termsOfServices, licenseAgreement } from '../../config';
import TranslatedText from '../TranslatedText';

/**
 * GDPRFooter Component
 *
 * A reusable footer component that displays Privacy Policy and Cookies Preference links.
 *
 * @param {Object} props
 * @param {string} props.variant - Style variant to apply. Options: 'default', 'login', 'app'
 *
 */
export default function GDPRFooter({ variant = 'default' }) {
  const variantClasses = {
    default: 'gdpr-footer',
    login: 'gdpr-footer gdpr-footer--login',
    app: 'gdpr-footer gdpr-footer--app',
  };

  const handleCookiePreferenceClick = (e) => {
    e.preventDefault();

    // Check if Osano is available and show the cookie consent drawer
    if (window.Osano && window.Osano.cm && typeof window.Osano.cm.showDrawer === 'function') {
      window.Osano.cm.showDrawer('purposes');
    } else {
      // Fallback if Osano is not loaded - redirect to privacy policy
      window.open(privacyPolicy, '_blank', 'noreferrer');
    }
  };

  return (
    <div className={variantClasses[variant] || variantClasses.default}>
      <p>
        <a href={privacyPolicy} target="_blank" rel="noreferrer">
          <TranslatedText text="Privacy Policy" />
        </a>
        <a
          href={privacyPolicy}
          onClick={handleCookiePreferenceClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCookiePreferenceClick(e);
            }
          }}
          role="button"
          tabIndex="0"
          aria-label="Open cookie preferences settings"
          style={{ cursor: 'pointer' }}
        >
          <TranslatedText text="Cookies Preference" />
        </a>
        <a href={termsOfServices} target="_blank" rel="noreferrer">
          <TranslatedText text="Terms of Use" />
        </a>
        <a href={licenseAgreement} target="_blank" rel="noreferrer">
          <TranslatedText text="License Agreement" />
        </a>
      </p>
    </div>
  );
}
