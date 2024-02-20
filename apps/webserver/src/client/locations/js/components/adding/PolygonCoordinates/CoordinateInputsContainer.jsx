import React from 'react';
import { Grid, Button, Tab, Tabs } from '@mui/material';
import IconPlus from '../../../../../common/js/components/icon/IconPlus';
import CoordinateInputRow from './CoordinateInputRow';

const CoordinateInputsContainer = ({
  coordinates,
  onCoordinatesChange,
  onDeleteCoordinate,
  onAddCoordinate,
  isPolygon,
  setIsPolygon,
}) => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <h3 style={{ margin: '5px 0px' }}>Add coordinates</h3>
    </Grid>
    <Grid item xs={12}>
      <Tabs
        value={isPolygon ? 'polygon' : 'point'}
        onChange={(e, value) => setIsPolygon(value === 'polygon')}
        style={{ marginBottom: '0.7rem' }}
        TabIndicatorProps={{ style: { background: '#97bd3d' } }}
      >
        <Tab label={<span style={{ color: 'black' }}>{'point'}</span>} value={'point'} />
        <Tab label={<span style={{ color: 'black' }}>{'polygon'}</span>} value={'polygon'} />
      </Tabs>
    </Grid>
    <Grid item xs={1}></Grid>
    <Grid item xs={5}>
      <label>latitude</label>
    </Grid>
    <Grid item xs={5}>
      <label>longitude</label>
    </Grid>
    <Grid item xs={12}>
      {coordinates.map(({ id, latitude, longitude, errors }, index) => (
        <CoordinateInputRow
          key={id}
          id={id}
          index={index}
          latitude={latitude}
          longitude={longitude}
          errors={errors}
          onCoordinatesChange={onCoordinatesChange}
          onDeleteCoordinate={onDeleteCoordinate}
          showDeleteIcon={isPolygon && coordinates.length > 3}
        />
      ))}
    </Grid>

    {isPolygon && coordinates.length < 10 && (
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
    )}
  </Grid>
);

export default CoordinateInputsContainer;
