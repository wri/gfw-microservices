import React from 'react';
import { Grid } from '@mui/material';
import CoordinateInputRow from './CoordinateInputRow';

const CoordinateInputsContainer = ({
  coordinates,
  onCoordinatesChange,
  onDelete,
  onlyOneCorodinatesRow,
}) => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <h3 style={{ margin: '5px 0px' }}>Add coordinates</h3>
    </Grid>
    <Grid item xs={1}></Grid>
    <Grid item xs={5}>
      <label>latitude</label>
    </Grid>
    <Grid item xs={5}>
      <label>longitude</label>
    </Grid>
    <Grid item xs={12}>
      {coordinates.map(({ lat, long }, index) => (
        <CoordinateInputRow
          key={index}
          index={index}
          lat={lat}
          long={long}
          onCoordinatesChange={onCoordinatesChange}
          onDelete={onDelete}
          onlyOneCorodinatesRow={onlyOneCorodinatesRow}
        />
      ))}
    </Grid>
  </Grid>
);

export default CoordinateInputsContainer;
