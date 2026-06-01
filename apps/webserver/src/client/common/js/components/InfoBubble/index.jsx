import { useState } from 'react';

import { IconButton, Popover } from '@mui/material';
import { Info } from '@mui/icons-material';
import InfoBubbleBase from './InfoBubbleBase';
import InfoBubbleContent from './InfoBubbleContent';
import './infoBubble.scss';

export default function InfoBubble({ children, infoBubbleId, sx }) {
  const [showBubble, setShowBubble] = useState(false);
  const [anchorEl, setAnchorEl] = useState();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setShowBubble(true);
    event.stopPropagation();
  };

  const handleClose = () => {
    setShowBubble(false);
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <IconButton onClick={handleOpen} id={infoBubbleId} size="small" sx={{ ml: 1, ...sx }}>
        <Info fontSize="inherit" />
      </IconButton>
      <Popover
        open={showBubble}
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        onClose={handleClose}
      >
        {infoBubbleId ? (
          <InfoBubbleBase closeBubble={handleClose}>
            <InfoBubbleContent infoBubbleId={infoBubbleId} />
          </InfoBubbleBase>
        ) : (
          <InfoBubbleBase closeBubble={handleClose}>
            <div>{children}</div>
          </InfoBubbleBase>
        )}
      </Popover>
    </div>
  );
}
