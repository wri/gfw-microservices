import React from 'react';

const tagStyles = {
  fontSize: '0.6rem',
  color: 'rgba(0, 0, 0, 0.37)',
  fontStyle: 'italic',
  verticalAlign: 'middle',
  marginLeft: '3px',
};

const BetaTag = ({children}) => {
  return <span style={tagStyles}>{children}</span>;
};

export default BetaTag;
