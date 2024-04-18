import React from 'react';
import Banner from './Banner';
import { locationsPage } from '../../config';

export default function UsageLimitBanner({ onBannerClose }) {
  return (
    <Banner className="landing-banner" intent="notice" onBannerClose={() => onBannerClose()}>
      <>
        <div>
          <strong>{locationsPage.usageReachingLimitBanner.title}</strong>
        </div>
        <div>
          {locationsPage.usageReachingLimitBanner.text}
        </div>
      </>
    </Banner>
  );
}
