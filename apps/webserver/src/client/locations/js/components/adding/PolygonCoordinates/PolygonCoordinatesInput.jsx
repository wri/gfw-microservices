import React, { useState } from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Point from '@arcgis/core/geometry/Point';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Graphic from '@arcgis/core/Graphic';
import Modal from '@mui/material/Modal';
import { default as GfwButton } from '../../../../../common/js/components/Button';
import CoordinateInputsContainer from './CoordinateInputsContainer';
import RadiusOptions from './RadiusOptions';
import './PolygonCoordinatesInput.scss';

const PolygonCoordinatesInput = ({ sketchViewModel, mapView }) => {
  const [selectedRadius, setSelectedRadius] = useState('big');
  const [coordinates, setCoordinates] = useState([
    { id: Date.now(), latitude: null, longitude: null },
  ]);
  const [customRadiusSize, setCustomRadiusSize] = useState();
  const [areaUnit, setAreaUnit] = useState('ha');
  const [open, setOpen] = useState(false);
  const onlyOneCoordinatesRow = coordinates.length === 1;

  const onCoordinatesChange = (event, id, field) => {
    const result = coordinates.map((row) =>
      row.id === id ? { ...row, [field]: event.target.value } : row
    );

    setCoordinates(result);
  };

  const onAddCoordinate = () => {
    const newCoordinate = {
      id: Date.now(),
      latitude: null,
      longitude: null,
    };
    setCoordinates([...coordinates, newCoordinate]);
  };

  const onDeleteCoordinate = (id) => {
    if (onlyOneCoordinatesRow) {
      // User can't delete the coordinates if there is only one row
      return;
    }

    const filteredCoordinates = coordinates.filter((coord) => coord.id !== id);
    setCoordinates(filteredCoordinates);
  };

  const addNewPoint = () => {
    const { latitude, longitude } = coordinates[0];

    /*
      radius options:

      small: 1000 hectares (1.78 km radius)
      medium: 5000 hectares (3.99 km radius)
      big: 20000hectares (7.98 km radius)
      Custom Radius: user can input a custom radius size in hectares (radius must be calculated) or kilometers (radius)
    */

    let radius;

    switch (selectedRadius) {
      case 'small':
        radius = 1780; // 1.78 km
        break;
      case 'medium':
        radius = 3990; // 3.99 km
        break;
      case 'big':
        radius = 7980; // 7.98 km
        break;
      case 'custom':
        if (areaUnit === 'km') {
          radius = customRadiusSize;
        } else {
          // User inputs area in hectares, calculate radius
          radius = Math.sqrt((customRadiusSize * 10000) / Math.PI);
        }
        break;
      default:
        break;
    }

    const pointGeometry = new Point({
      longitude,
      latitude,
      spatialReference: {
        wkid: 4326,
      },
    });

    const bufferGeometry = geometryEngine.geodesicBuffer(pointGeometry, radius, 'meters');

    return bufferGeometry;
  };

  const addNewPolygon = () => {
    const polygonCoordinates = coordinates.map((coord) => [coord.longitude, coord.latitude]);

    const polygon = {
      type: 'polygon',
      rings: polygonCoordinates,
    };

    return polygon;
  };

  const handleSubmit = () => {
    mapView.graphics.removeAll();
    sketchViewModel.delete();

    let geometry;
    if (onlyOneCoordinatesRow) {
      geometry = addNewPoint();
    } else {
      geometry = addNewPolygon();
    }

    const symbol = new SimpleFillSymbol({
      color: [151, 189, 61, 0.65],
      outline: {
        color: [151, 189, 61, 1],
        width: 1,
      },
    });

    const graphic = new Graphic({
      geometry,
      symbol,
    });

    mapView.graphics.add(graphic);

    setTimeout(() => {
      mapView.goTo(
        {
          target: graphic,
        },
        { duration: 1000 }
      );
    }, 500);

    setOpen(false);
  };
  // disable if there are coordinates with null values or if there are only two coordinates (a line)
  const isSubmitDisabled =
    coordinates.some((coord) => coord.latitude === null || coord.longitude === null) ||
    coordinates.length === 2;

  return (
    <div>
      <Button style={{ position: 'absolute', zIndex: 100 }} onClick={() => setOpen(true)}>
        <AddLocationIcon />
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Card className="polygon-coordinates">
          <CoordinateInputsContainer
            onlyOneCoordinatesRow={onlyOneCoordinatesRow}
            coordinates={coordinates}
            onCoordinatesChange={onCoordinatesChange}
            onDeleteCoordinate={onDeleteCoordinate}
            onAddCoordinate={onAddCoordinate}
          />
          {onlyOneCoordinatesRow && (
            <RadiusOptions
              selectedRadius={selectedRadius}
              setSelectedRadius={setSelectedRadius}
              customRadiusSize={customRadiusSize}
              setCustomRadiusSize={setCustomRadiusSize}
              areaUnit={areaUnit}
              setAreaUnit={setAreaUnit}
            />
          )}
          <GfwButton
            type="button"
            variant="primary"
            disable={!coordinates.length}
            style={{ float: 'right' }}
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            OK
          </GfwButton>
        </Card>
      </Modal>
    </div>
  );
};

export default PolygonCoordinatesInput;
