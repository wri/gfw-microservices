import { Button } from '@mui/base';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import React, { useEffect, useState } from 'react';

import './mapRecenterButton.scss';

const MapRecenterButton = ({ selectedList = [], goToOriginalPoint }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (selectedList.length > 0) {
      setShowButton(true);
    }
  }, [selectedList]);

  return (
    <>
      {showButton && (
        <Button
          data-testid="map-center-button"
          onClick={goToOriginalPoint}
          className="gfw-button btn-green center-button"
          style={{ marginTop: '20px' }}
        >
          <FmdGoodIcon />
          back to location (s)
        </Button>
      )}
    </>
  );
};

export default MapRecenterButton;
