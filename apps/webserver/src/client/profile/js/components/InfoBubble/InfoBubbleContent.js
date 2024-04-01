import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

import '../../../../locations/css/diagnosticsBubble.scss';

export default function InfoBubbleContent({ children, closeBubble }) {
  return (
    <div className="locations-diagnostics-bubble-view-container info-bubble-content">
      <div
        title="close"
        className="app__modal-close-icon-container info-bubble-content__icon"
        onClick={closeBubble}
      >
        <CloseIcon />
      </div>
      <div className="locations-diagnostics-bubble-view">{children}</div>
    </div>
  );
}
