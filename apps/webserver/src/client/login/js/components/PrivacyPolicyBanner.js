import { Component } from 'react';

/**
 * @deprecated This component has been replaced by Osano cookie consent management.
 * Osano script is now loaded in layout.pug and handles all cookie consent.
 * This file is kept for reference but should not be used.
 * Date deprecated: December 2025
 */

const PRIVACY_POLICY_LINK = 'https://www.wri.org/about/privacy-policy';

export class PrivacyPolicyBanner extends Component {
  constructor() {
    super();

    const cookies = document.cookie.split(';').reduce((res, current) => {
      const [key, val] = current.trim().split('=');
      return Object.assign(res, { [key]: val });
    }, {});

    this.state = {
      PrivacyPolicyChecked: !!(cookies && cookies.PrivacyPolicyChecked),
    };
  }

  _handlePrivacyPolicy() {
    const now = new Date();
    const cookieExpire = new Date();
    const oneDay = 1000 * 60 * 60 * 24;
    cookieExpire.setTime(now.getTime() + oneDay * 30);
    document.cookie =
      'PrivacyPolicyChecked=true; expires=' + cookieExpire.toUTCString() + '; path=/;';
    this.setState({ PrivacyPolicyChecked: true });
  }

  render() {
    const { PrivacyPolicyChecked } = this.state;

    return (
      <div id="PrivacyPolicyBanner" className={PrivacyPolicyChecked ? 'hidden' : null}>
        This website uses cookies to provide you with an improved user experience. By continuing to
        browse this site, you consent to the use of cookies and similar technologies. For further
        details please visit our{' '}
        <a href={PRIVACY_POLICY_LINK} style={{ color: '#97BD3D' }} target="_blank">
          privacy policy
        </a>
        .
        <button
          className="button button--primary"
          style={{ margin: '0 0.75rem' }}
          onClick={() => this._handlePrivacyPolicy()}
        >
          OK
        </button>
      </div>
    );
  }
}
