import React, { useState } from 'react';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Graphic from '@arcgis/core/Graphic';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import Modal from '@mui/material/Modal';
import { v4 as uuidv4 } from 'uuid';
import GfwButton from '../../../../../common/js/components/GfwButton';
import CoordinateInputsContainer from './CoordinateInputsContainer';
import SetArea from '../SetArea';
import { getPointGeometry, getPolygonGeometry } from './geometries';
import { NEW_LOCATION_AREA_OPTIONS } from '../areaOptions.constants';
import './PolygonCoordinatesInput.scss';

const newCoordinate = () => ({ id: uuidv4(), latitude: '', longitude: '', errors: {} });

const PolygonCoordinatesInput = ({
  sketchViewModel,
  mapView,
  setGeometry,
  measurementUnit,
  setMeasurementUnit,
}) => {
  const [selectedAreaRadioOption, setSelectedAreaRadioOption] = useState(
    NEW_LOCATION_AREA_OPTIONS.SMALL.id
  );
  const [coordinates, setCoordinates] = useState([newCoordinate()]);
  const [customArea, setCustomArea] = useState();
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
    if (coordinates.length === 1) {
      // if there is only one row, add two more, user should not be able to enter a line
      setCoordinates([...coordinates, newCoordinate(), newCoordinate()]);
    } else {
      setCoordinates([...coordinates, newCoordinate()]);
    }
  };

  const onDeleteCoordinate = (id) => {
    if (onlyOneCoordinatesRow) {
      // User can't delete the coordinates if there is only one row
      return;
    }

    if (coordinates.length === 3) {
      // if there are three rows, remove two rows
      const updatedCoordinates = [coordinates[0]]; // Keep only the first coordinate
      setCoordinates(updatedCoordinates);
    } else {
      const filteredCoordinates = coordinates.filter((coord) => coord.id !== id);
      setCoordinates(filteredCoordinates);
    }
  };

  const handleSubmit = () => {
    mapView.graphics.removeAll();
    sketchViewModel.delete();

    let geometry;
    if (onlyOneCoordinatesRow) {
      geometry = getPointGeometry(
        coordinates,
        selectedAreaRadioOption,
        measurementUnit,
        customArea
      );
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

  // disable if custom area was selected and there is not custom area value
  // if there are coordinates with null values
  // if there are only two coordinates (a line)
  // if there are errors
  const isSubmitDisabled =
    (selectedAreaRadioOption === NEW_LOCATION_AREA_OPTIONS.CUSTOM.id && !customArea) ||
    coordinates.some(
      (coord) =>
        coord.latitude === '' ||
        coord.longitude === '' ||
        coord.errors.latitude ||
        coord.errors.longitude
    ) ||
    coordinates.length === 2;

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
            <SetArea
              selectedAreaRadioOption={selectedAreaRadioOption}
              setSelectedAreaRadioOption={setSelectedAreaRadioOption}
              measurementUnit={measurementUnit}
              setMeasurementUnit={setMeasurementUnit}
              customArea={customArea}
              setCustomArea={setCustomArea}
            />
          )}
          {errorMessage}
          <div className="polygon-coordinates__actions">
            <Button variant="text" style={{ color: 'gray' }} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <GfwButton
              buttonStyle={{
                marginLeft: '20px',
              }}
              classNames="btn-green"
              disabled={isSubmitDisabled}
              onClick={handleSubmit}
              value="OK"
            >
              OK
            </GfwButton>
          </div>
        </Card>
      </Modal>
    </div>
  );
};

export default PolygonCoordinatesInput;
