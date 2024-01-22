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
    { id: 0, latitude: 34.0005930608889, longitude: -118.80657463861 },
  ]);
  const [customRadiusSize, setCustomRadiusSize] = useState();
  const [areaUnit, setAreaUnit] = useState('ha');
  const [open, setOpen] = useState(false);
  const onlyOneCorodinatesRow = coordinates.length === 1;

  const onCoordinatesChange = (event, index, field) => {
    const result = coordinates.map((row) =>
      row.id === index ? { ...row, [field]: event.target.value } : row
    );

    setCoordinates(result);
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

  const onDeleteCoordinate = (index) => {
    if (onlyOneCorodinatesRow) {
      // user can't delete the coordinates if there is only one row
      return;
    }
    const filteredCoordinates = coordinates.filter((coord) => coord.id !== index);
    setCoordinates(filteredCoordinates);
  };

  const addNewPolygon = () => {

    const polygonCoordinates = coordinates.map(coord => [coord.longitude, coord.latitude]);

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
    if (onlyOneCorodinatesRow) {
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
            onlyOneCorodinatesRow={onlyOneCorodinatesRow}
            coordinates={coordinates}
            onCoordinatesChange={onCoordinatesChange}
            onDelete={onDeleteCoordinate}
          />
          {onlyOneCorodinatesRow && (
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
