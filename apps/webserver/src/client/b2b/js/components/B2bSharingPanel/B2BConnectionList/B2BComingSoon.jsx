import React from 'react';
import Card from '@mui/material/Card';
import FactoryTwoToneIcon from '@mui/icons-material/FactoryTwoTone';
import BusinessCenterTwoToneIcon from '@mui/icons-material/BusinessCenterTwoTone';
import WorkTwoToneIcon from '@mui/icons-material/WorkTwoTone';
import FolderSharedTwoToneIcon from '@mui/icons-material/FolderSharedTwoTone';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import StoreTwoToneIcon from '@mui/icons-material/StoreTwoTone';
import { profilePage } from '../../../../../common/js/config';

function B2BComingSoon() {
  return (
    <div style={{ width: '700px', margin: 'auto' }}>
      <Card style={{ textAlign: 'center', padding: '40px', marginTop: '60px' }}>
        <div>
          <div className="new-b2b-connection-modal__icons">
            <div>
              <FactoryTwoToneIcon style={{ color: '#F24E1E' }} />
            </div>
            <div>
              <BusinessCenterTwoToneIcon style={{ color: '#1ABCFE' }} />
            </div>
            <div>
              <WorkTwoToneIcon style={{ color: '#000000' }} />
            </div>
            <div>
              <FolderSharedTwoToneIcon style={{ color: '#FF8A00', fontSize: '2.8rem' }} />
            </div>
            <div>
              <StorefrontTwoToneIcon style={{ color: '#FF0000' }} />
            </div>
            <div>
              <StoreTwoToneIcon style={{ color: '#A259FF' }} />
            </div>
            <div>
              <BusinessTwoToneIcon style={{ color: '#97BD3D' }} />
            </div>
          </div>
          <h3>{profilePage.profileManager.b2bSection.b2bCommingSoonTitle}</h3>
          <div style={{ color: 'gray' }}>
            {profilePage.profileManager.b2bSection.b2bCommingSoonDescription1}{' '}
            <a style={{ color: '#97bd3d' }} href="mailto:gfwprosupport@wri.org">
              gfwprosupport@wri.org
            </a>{' '}
            {profilePage.profileManager.b2bSection.b2bCommingSoonDescription2}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default B2BComingSoon;
