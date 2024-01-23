import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CoordinateInputRow = ({
  id,
  index,
  latitude,
  longitude,
  onCoordinatesChange,
  onDeleteCoordinate,
  onlyOneCoordinatesRow,
}) => (
  <Box display="flex" sx={{ alignItems: 'center' }}>
    <Grid item xs={1}>
      <Typography>{index + 1}</Typography>
    </Grid>
    <Grid item xs={5}>
      <input
        type="number"
        name="latitude"
        value={latitude}
        onChange={(event) => onCoordinatesChange(event, id, 'latitude')}
      />
    </Grid>
    <Grid item xs={5}>
      <input
        type="number"
        name="longitude"
        value={longitude}
        onChange={(event) => onCoordinatesChange(event, id, 'longitude')}
      />
    </Grid>
    <Grid item xs={1}>
      {!onlyOneCoordinatesRow && (
        <CloseIcon style={{ cursor: 'pointer' }} onClick={() => onDeleteCoordinate(id)} />
      )}
    </Grid>
  </Box>
);

export default CoordinateInputRow;
