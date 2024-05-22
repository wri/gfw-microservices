import React, { useState, useRef } from 'react';
import IconButton from 'material-ui/IconButton';
import InfoIcon from 'material-ui/svg-icons/action/info';
import InfoBubbleBase from './InfoBubbleBase';
import InfoBubbleContent from './InfoBubbleContent';
import Popover from 'material-ui/Popover';
import './infoBubble.scss';

export default function InfoBubble({ children, infoBubbleId }) {
  const [showBubble, setShowBubble] = useState(false);
  const [anchorEl, setAnchorEl] = useState();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
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
      <Popover
        open={showBubble}
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        onRequestClose={handleClose}
      >
        {infoBubbleId ? (
          <InfoBubbleBase closeBubble={handleClose}>
            <InfoBubbleContent infoBubbleId={infoBubbleId} />
          </InfoBubbleBase>
        ) : (
          <InfoBubbleBase closeBubble={handleClose}>
            <div dangerouslySetInnerHTML={{ __html: children }}></div>
          </InfoBubbleBase>
        )}
      </Popover>
    </div>
  );
}
