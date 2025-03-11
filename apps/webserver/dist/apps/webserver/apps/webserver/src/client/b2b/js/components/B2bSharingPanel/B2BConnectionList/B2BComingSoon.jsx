import React from 'react';
import { profilePage } from '../../../../../common/js/config';
import B2BImageCard from './B2BImageCard';

function B2BComingSoon() {
  return (
    <div style={{ width: '700px', margin: 'auto' }}>
      <B2BImageCard title={profilePage.profileManager.b2bSection.b2bCommingSoonTitle}>
        {profilePage.profileManager.b2bSection.b2bCommingSoonDescription1}{' '}
        <a style={{ color: '#97bd3d' }} href="mailto:gfwprosupport@wri.org">
          gfwprosupport@wri.org
        </a>{' '}
        {profilePage.profileManager.b2bSection.b2bCommingSoonDescription2}
      </B2BImageCard>
    </div>
  );
}

export default B2BComingSoon;
