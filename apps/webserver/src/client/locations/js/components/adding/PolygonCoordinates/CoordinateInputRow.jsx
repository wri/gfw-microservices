import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import './CoordinateInputRow.scss';

const CoordinateInputRow = ({
  id,
  index,
  latitude,
  longitude,
  errors,
  onCoordinatesChange,
  onDeleteCoordinate,
  onlyOneCoordinatesRow,
}) => (
  <Box className="coordinate-input-row">
    <Grid container alignItems="center" display="flex" spacing={1}>
      <Grid item xs={1}>
        <Box className="coordinate-input-row__cell coordinate-input-row__index">
          <Typography>{index + 1}</Typography>
        </Box>
      </Grid>
      <Grid item xs={5}>
        <Box className="coordinate-input-row__cell">
          <TextField
            type="number"
            name="latitude"
            value={latitude}
            onChange={(event) => onCoordinatesChange(event, id, 'latitude')}
            data-testid={`latitude-input-${index}`}
            error={errors.latitude}
            className="coordinate-input-row__input"
            helperText={errors.latitude && 'Invalid latitude'}
            size="small"
          />
        </Box>
      </Grid>
      <Grid item xs={5}>
        <Box className="coordinate-input-row__cell">
          <TextField
            type="number"
            name="longitude"
            value={longitude}
            onChange={(event) => onCoordinatesChange(event, id, 'longitude')}
            data-testid={`longitude-input-${index}`}
            error={errors.longitude}
            className="coordinate-input-row__input"
            helperText={errors.longitude && 'Invalid longitude'}
            size="small"
          />
        </Box>
      </Grid>
      <Grid item xs={1}>
        <Box className="coordinate-input-row__cell">
          {!onlyOneCoordinatesRow && (
            <CloseIcon
              data-testid={`coordinate-input-remove-row-${index}`}
              className="coordinate-input-row__delete-icon"
              onClick={() => onDeleteCoordinate(id)}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  </Box>
);

export default CoordinateInputRow;
