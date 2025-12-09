import './GDPRFooter.scss';

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
      window.open('https://www.globalforestwatch.org/privacy-policy/', '_blank', 'noreferrer');
    }
  };

  return (
    <div className={variantClasses[variant] || variantClasses.default}>
      <p>
        <a
          href="https://www.globalforestwatch.org/privacy-policy/"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>{' '}
        <a
          href="https://www.globalforestwatch.org/privacy-policy/"
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
          Cookies Preference
        </a>
      </p>
    </div>
  );
}
