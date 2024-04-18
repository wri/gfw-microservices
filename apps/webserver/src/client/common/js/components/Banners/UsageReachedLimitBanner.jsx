import React from 'react';
import Banner from './Banner';
import { locationsPage } from '../../config';

export default function UsageReachedLimitBanner({ onBannerClose }) {
  return (
    <Banner className="landing-banner" intent="danger" onBannerClose={() => onBannerClose()}>
      <div>
        <strong>{locationsPage.usegeReachedLimitBanner.title}</strong>
      </div>
      <div>
        {locationsPage.usegeReachedLimitBanner.text}
      </div>
    </Banner>
  );
}
