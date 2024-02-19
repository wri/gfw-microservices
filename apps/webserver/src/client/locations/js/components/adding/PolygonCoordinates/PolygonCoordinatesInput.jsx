import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Graphic from '@arcgis/core/Graphic';
import Modal from '@mui/material/Modal';
import { v4 as uuidv4 } from 'uuid';
import Button from '@mui/material/Button';
import GfwButton from '../../../../../common/js/components/GfwButton';
import CoordinateInputsContainer from './CoordinateInputsContainer';
import SetArea from '../SetArea';
import { getPointGeometry, getPolygonGeometry } from './geometries';
import { NEW_LOCATION_AREA_OPTIONS } from '../areaOptions.constants';
import './PolygonCoordinatesInput.scss';
import LocationMapDrawer from '../LocationMapDrawer';

const newCoordinate = () => ({ id: uuidv4(), latitude: '', longitude: '', errors: {} });

const PolygonCoordinatesInput = ({
  sketchViewModel,
  mapView,
  setGeometry,
  setSketchViewModel,
  measurementUnit,
  setMeasurementUnit,
  geometry,
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

  useEffect(() => {
    // initialize with the coordinates of the geometry that is being edited
    const numberOfVertices = geometry?.rings?.[0]?.length;

    // if there are more than 10 vertices,
    // we assume it is a circle created by entering a point and a radius,
    // so we don't want to edit the coordinates
    if (numberOfVertices > 1 && numberOfVertices < 11) {
      const rings = geometry.rings[0];
      const vertices = rings.slice(0, -1); // we remove the last vertex because it is the same as the first one
      const initialCoordinates = vertices.map(([longitude, latitude]) => ({
        id: uuidv4(),
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        errors: {},
      }));
      setCoordinates(initialCoordinates);
    }
  }, [geometry]);

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
      let polygonCoordinates = [...coordinates]; // Copy the coordinates array
      const firstPoint = polygonCoordinates[0]; // copy the first point as the last point to close the polygon
      polygonCoordinates.push(firstPoint);
      geometry = getPolygonGeometry(polygonCoordinates);
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
      <div className="draw-shape__button-group">
        <button
          className="draw-shape__draw-button"
          onClick={() => setOpen(true)}
          data-testid="polygon-coordinates-button"
        >
          <AddLocationIcon />
          <span>Add coordinates</span>
        </button>

        <LocationMapDrawer
          mapView={mapView}
          sketchViewModel={sketchViewModel}
          setSketchViewModel={setSketchViewModel}
          setGeometry={setGeometry}
        />
      </div>

      <div className="draw-shape__button-group" style={{ right: '1rem', left: 'auto' }}>
        <GfwButton onClick={() => setOpen(true)} value="EDIT COORDINATES" />
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        data-testid="polygon-coordinates-modal"
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
