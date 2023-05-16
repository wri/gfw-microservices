import React from 'react';
import './NewB2bConnectionModal/NewB2bConnectionModal.scss';
import B2BComingSoon from './B2BConnectionList/B2BComingSoon';
import B2bConnectionsList from './B2bConnectionsList';

const B2bSharingPanel = () => {
  const B2bConnectionsEnabled = true;

  return B2bConnectionsEnabled ? <B2bConnectionsList /> : <B2BComingSoon />;
};

export default B2bSharingPanel;
