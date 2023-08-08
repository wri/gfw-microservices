import React from 'react';
import FactoryTwoToneIcon from '@mui/icons-material/FactoryTwoTone';
import BusinessCenterTwoToneIcon from '@mui/icons-material/BusinessCenterTwoTone';
import WorkTwoToneIcon from '@mui/icons-material/WorkTwoTone';
import FolderSharedTwoToneIcon from '@mui/icons-material/FolderSharedTwoTone';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import StoreTwoToneIcon from '@mui/icons-material/StoreTwoTone';

function B2BImageList() {
  return (
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
  );
}

export default B2BImageList;
