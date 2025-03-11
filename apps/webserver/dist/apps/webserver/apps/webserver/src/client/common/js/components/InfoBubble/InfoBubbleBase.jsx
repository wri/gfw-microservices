import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

export default function InfoBubbleBase({ children, closeBubble }) {
  return (
    <div className="info-bubble-content">
      <div title="close" className="info-bubble-content__icon" onClick={closeBubble}>
        <CloseIcon />
      </div>
      <div className="info-bubble-content__view">{children}</div>
    </div>
  );
}
