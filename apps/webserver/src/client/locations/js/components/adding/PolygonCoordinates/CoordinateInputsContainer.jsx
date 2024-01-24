import React from 'react';
import { Grid, Button } from '@mui/material';
import IconPlus from '../../../../../common/js/components/icon/IconPlus';

import CoordinateInputRow from './CoordinateInputRow';

const CoordinateInputsContainer = ({
  coordinates,
  onCoordinatesChange,
  onDeleteCoordinate,
  onlyOneCoordinatesRow,
  onAddCoordinate,
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
      {coordinates.map(({ id, latitude, longitude }, index) => (
        <CoordinateInputRow
          key={id}
          id={id}
          index={index}
          latitude={latitude}
          longitude={longitude}
          onCoordinatesChange={onCoordinatesChange}
          onDeleteCoordinate={onDeleteCoordinate}
          onlyOneCoordinatesRow={onlyOneCoordinatesRow}
        />
      ))}
    </Grid>

    <Grid item xs={12}>
      <Button
        style={{
          color: '#97bd3d',
          border: '1px dashed',
          width: '100%',
          background: 'rgba(151, 189, 61, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '10px',
        }}
        variant="outlined"
        startIcon={<IconPlus height="10px" />}
        onClick={onAddCoordinate}
      >
        Add Coordinate
      </Button>
    </Grid>
  </Grid>
);

export default CoordinateInputsContainer;
