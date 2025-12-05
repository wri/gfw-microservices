import './GPDRFooter.scss';

/**
 * GPDRFooter Component
 *
 * A reusable footer component that displays Privacy Policy and Cookies Preference links.
 *
 * @param {Object} props
 * @param {string} props.variant - Style variant to apply. Options: 'default', 'login', 'app'
 *
 */
export default function GPDRFooter({ variant = 'default' }) {
  const variantClasses = {
    default: 'gpdr-footer',
    login: 'gpdr-footer gpdr-footer--login',
    app: 'gpdr-footer gpdr-footer--app',
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
          style={{ cursor: 'pointer' }}
        >
          Cookies Preference
        </a>
      </p>
    </div>
  );
}
