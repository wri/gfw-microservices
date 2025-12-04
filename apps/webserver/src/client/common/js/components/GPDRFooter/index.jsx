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

  return (
    <div className={variantClasses[variant] || variantClasses.default}>
      <p>
        <a href="https://www.globalforestwatch.org/privacy-policy/" target="_blank" rel="noreferrer">
          Privacy Policy
        </a>{' '}
        <a href="https://www.globalforestwatch.org/privacy-policy/" target="_blank" rel="noreferrer">
          Cookies Preference
        </a>
      </p>
    </div>
  );
}
