import React from 'react';
import Banner from './Banner';

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
          <strong>You have reached your usage limit</strong>
        </div>
        <div>To continue parsing your lists, you need to increase the usage limit. {cta}.</div>
      </>
    </Banner>
  );
}
