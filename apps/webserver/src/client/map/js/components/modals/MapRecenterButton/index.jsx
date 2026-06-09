import { useEffect, useState } from 'react';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PillButton } from '../../../../../components';

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
        <Box
          sx={(theme) => ({
            display: 'inline-flex',
            padding: '4px',
            margin: '15px auto',
            borderRadius: '8px',
            border: `1px solid ${theme.palette.neutral[400]}`,
            background: alpha(theme.palette.neutral[100], 0.6),
            boxShadow:
              '0px 4px 12.1px 0px rgba(0, 0, 0, 0.25) inset, 0px 2px 8px 0px rgba(87, 86, 86, 0.08)',
          })}
        >
          <PillButton
            variant="contained"
            size="small"
            data-testid="map-center-button"
            onClick={goToOriginalPoint}
            sx={(theme) => ({
              borderRadius: '4px',
              border: `1px solid ${theme.palette.primary[800]}`,
              background: theme.palette.neutral[100],
              color: theme.palette.primary[800],
              '&:hover': {
                background: theme.palette.neutral[100],
                borderColor: theme.palette.primary[800],
              },
            })}
          >
            <FmdGoodIcon />
            back to location (s)
          </PillButton>
        </Box>
      )}
    </ThemeProvider>
  );
};

export default MapRecenterButton;
