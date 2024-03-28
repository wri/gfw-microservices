import React, { useState } from 'react';
import IconButton from 'material-ui/IconButton';
import InfoIcon from 'material-ui/svg-icons/action/info';
import InfoBubbleContent from './InfoBubbleContent';

export default function InfoBubble({ children }) {
  const [showBubble, setShowBubble] = useState(false);
  const handleOpen = () => {
    setShowBubble(true);
  };

  const handleClose = () => {
    setShowBubble(false);
  };
  return (
    <div style={{ display: 'inline-block' }}>
      <IconButton
        style={{ padding: 0, width: 15, height: 15, marginLeft: '10px', verticalAlign: 'middle' }}
        iconStyle={{ padding: 0, width: 15, height: 15 }}
        className="metadata-info-button"
        onClick={handleOpen}
      >
        <InfoIcon color="gray" />
      </IconButton>
      {showBubble && (
        <InfoBubbleContent closeBubble={handleClose} bubbleData="test">
          {children}
        </InfoBubbleContent>
      )}
    </div>
  );
}
