import { useEffect, useState } from 'react';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import { PillButton } from '../../../../../components';

import './mapRecenterButton.scss';
import { ThemeProvider } from '../../../../../styles/ThemeProvider';

const MapRecenterButton = ({
  selectedList = [],
  goToOriginalPoint,
  isMapMoving,
  isMapCentered,
}) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (selectedList.length > 0) {
      setShowButton(true);
    }
  }, [selectedList]);

  return (
    <ThemeProvider>
      {showButton && !isMapMoving && !isMapCentered && (
        <PillButton
          variant="contained"
          size="small"
          data-testid="map-center-button"
          onClick={goToOriginalPoint}
          sx={{ mt: 2, mx: 'auto' }}
        >
          <FmdGoodIcon />
          back to location (s)
        </PillButton>
      )}
    </ThemeProvider>
  );
};

export default MapRecenterButton;
