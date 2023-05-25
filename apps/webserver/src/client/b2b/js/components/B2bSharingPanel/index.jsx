import React from 'react';
import B2BComingSoon from './B2BConnectionList/B2BComingSoon';
import B2bConnectionsList from './B2bConnectionsList';
import './NewB2bConnectionModal/NewB2bConnectionModal.scss';

const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

const B2bSharingPanel = () => {
  return isProduction ? <B2BComingSoon /> : <B2bConnectionsList /> ;
};

export default B2bSharingPanel;
