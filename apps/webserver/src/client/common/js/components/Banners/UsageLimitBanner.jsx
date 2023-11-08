import React from 'react';
import Banner from './Banner';
import { locationsPage } from '../../../../common/js/config';

export default function UsageLimitBanner({ onBannerClose, onCtaClick = () => void 0 }) {
  const cta = (
    <a className="notice-cta" onClick={onCtaClick}>
      Click Here
    </a>
  );

  return (
    <Banner className="landing-banner" intent="notice" onBannerClose={() => onBannerClose()}>
      <>
        <div>
          <strong>{locationsPage.accountIsReachingLimitBanner}</strong>
        </div>
        <div>
          {locationsPage.accountReachingLimitBannerText} <div style={{display: 'none'}}>{cta}</div>
        </div>
      </>
    </Banner>
  );
}
