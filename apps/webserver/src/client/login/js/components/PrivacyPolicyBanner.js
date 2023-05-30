import React, { Component } from 'react';

const PRIVACY_POLICY_LINK =
  'https://d1ps9kreypzu9a.cloudfront.net/Training%20Guides/GFW%20Pro%20Landing%20Page/World%20Resources%20Institute%20-%20GFW%20Pro%20-%20Privacy%20Policy%207_2_2018.pdf';

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
