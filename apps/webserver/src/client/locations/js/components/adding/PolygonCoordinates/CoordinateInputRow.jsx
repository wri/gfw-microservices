import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CoordinateInputRow = ({
  index,
  latitude,
  longitude,
  onCoordinatesChange,
  onDelete,
  onlyOneCorodinatesRow,
}) => (
  <Box display="flex" sx={{ alignItems: 'center' }}>
    <Grid item xs={1}>
      <Typography>{index + 1}</Typography>
    </Grid>
    <Grid item xs={5}>
      <input
        type="number"
        value={latitude}
        onChange={(event) => onCoordinatesChange(event, index, 'latitude')}
      />
    </Grid>
    <Grid item xs={5}>
      <input
        type="number"
        value={longitude}
        onChange={(event) => onCoordinatesChange(event, index, 'longitude')}
      />
    </Grid>
    <Grid item xs={1}>
      {!onlyOneCorodinatesRow && (
        <CloseIcon style={{ cursor: 'pointer' }} onClick={() => onDelete(index)} />
      )}
    </Grid>
  </Box>
);

export default CoordinateInputRow;
