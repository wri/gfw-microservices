import React from 'react';

const tagStyles = {
  fontSize: '0.7rem',
  color: 'rgba(0, 0, 0, 0.37)',
  fontStyle: 'italic',
  verticalAlign: 'middle',
  marginLeft: '-8px',
};

const BetaTag = () => {
  return <span style={tagStyles}>(BETA)</span>;
};

export default BetaTag;
