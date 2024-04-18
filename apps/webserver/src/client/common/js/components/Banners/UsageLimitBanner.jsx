import React from 'react';
import Banner from './Banner';
import { locationsPage } from '../../../../common/js/config';

export default function UsageLimitBanner({ onBannerClose }) {
  return (
    <Banner className="landing-banner" intent="notice" onBannerClose={() => onBannerClose()}>
      <>
        <div>
          <strong>{locationsPage.accountIsReachingLimitBanner}</strong>
        </div>
        <div>{locationsPage.accountReachingLimitBannerText}.</div>
      </>
    </Banner>
  );
}
