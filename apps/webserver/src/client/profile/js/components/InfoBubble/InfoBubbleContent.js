import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

import '../../../../locations/css/diagnosticsBubble.scss';

export default function InfoBubbleContent({ children, closeBubble }) {
  const closeIconContainerStyle = {
    display: 'flex',
    height: '26px',
    width: '26px',
    float: 'right',
    cursor: 'pointer',
  };

  const containerStyle = {
    color: 'rgba(0, 0, 0, 0.87)',
    backgroundColor: 'rgb(255, 255, 255)',
    fontFamily: '"Fira Sans", sans-serif',
    boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
    borderRadius: '2px',
    width: '500px',
    position: 'fixed',
    padding: '15px',
    zIndex: 99999,
  };

  return (
    <div className="locations-diagnostics-bubble-view-container" style={containerStyle}>
      <div
        title="close"
        style={closeIconContainerStyle}
        className="app__modal-close-icon-container"
        onClick={closeBubble}
      >
        <CloseIcon />
      </div>
      <div className="locations-diagnostics-bubble-view">{children}</div>
    </div>
  );
}
