import React, { useState } from 'react';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Graphic from '@arcgis/core/Graphic';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import Modal from '@mui/material/Modal';
import GfwButton from '../../../../../common/js/components/GfwButton';
import CoordinateInputsContainer from './CoordinateInputsContainer';
import RadiusOptions from './RadiusOptions';
import { getPointGeometry, getPolygonGeometry } from './geometries';
import './PolygonCoordinatesInput.scss';

const PolygonCoordinatesInput = ({ sketchViewModel, mapView, setGeometry }) => {
  const [selectedRadius, setSelectedRadius] = useState('big');
  const [coordinates, setCoordinates] = useState([
    { id: Date.now(), latitude: '', longitude: '', errors: {} },
  ]);
  const [customRadiusSize, setCustomRadiusSize] = useState();
  const [areaUnit, setAreaUnit] = useState('ha');
  const [open, setOpen] = useState(false);

  // Validation functions
  const isValidLatitude = (value) => value !== null && value >= -90 && value <= 90;
  const isValidLongitude = (value) => value !== null && value >= -180 && value <= 180;

  const onlyOneCoordinatesRow = coordinates.length === 1;

  const onCoordinatesChange = (event, id, field) => {
    const value = parseFloat(event.target.value);
    const error = field === 'latitude' ? !isValidLatitude(value) : !isValidLongitude(value);

    const updatedCoordinates = coordinates.map((coord) => {
      if (coord.id === id) {
        return { ...coord, [field]: value, errors: { ...coord.errors, [field]: error } };
      }
      return coord;
    });

    setCoordinates(updatedCoordinates);
  };

  const onAddCoordinate = () => {
    const newCoordinate = { id: Date.now(), latitude: '', longitude: '', errors: {} };
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

  const handleSubmit = () => {
    mapView.graphics.removeAll();
    sketchViewModel.delete();

    let geometry;
    if (onlyOneCoordinatesRow) {
      geometry = getPointGeometry(coordinates, selectedRadius, areaUnit, customRadiusSize);
    } else {
      geometry = getPolygonGeometry(coordinates);
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
    setGeometry(geometry);
    setOpen(false);
  };
  // disable if there are coordinates with null values, if there are only two coordinates (a line), or if there are errors
  const isSubmitDisabled =
    coordinates.some(
      (coord) =>
        coord.latitude === '' ||
        coord.longitude === '' ||
        coord.errors.latitude ||
        coord.errors.longitude
    ) || coordinates.length === 2;

  const uniqueErrors = new Set();

  const errorMessage = coordinates.map((coord) => (
    <div key={coord.id}>
      {Object.entries(coord.errors).map(([field, error], index) => {
        if (error && !uniqueErrors.has(field)) {
          uniqueErrors.add(field);
          return (
            <div key={index} style={{ color: 'red', marginTop: '5px' }}>
              {`Invalid ${field}`}
            </div>
          );
        }
        return null;
      })}
    </div>
  ));

  return (
    <div>
      <Button
        data-testid="polygon-coordinates-button"
        style={{ position: 'absolute', zIndex: 100 }}
        onClick={() => setOpen(true)}
      >
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
            buttonStyle={{
              float: 'right',
            }}
            classNames="btn-green"
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
            value="OK"
          >
            OK
          </GfwButton>
          {errorMessage}
        </Card>
      </Modal>
    </div>
  );
};

export default PolygonCoordinatesInput;
