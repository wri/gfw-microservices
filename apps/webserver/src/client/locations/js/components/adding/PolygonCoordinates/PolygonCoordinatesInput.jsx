import { useState, useEffect } from 'react';
import { Card, Modal, Button } from '@mui/material';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import GfwButton from '../../../../../common/js/components/GfwButton';
import CoordinateInputsContainer from './CoordinateInputsContainer';
import SetArea from '../SetArea';
import LocationMapDrawer from '../LocationMapDrawer';
import { NEW_LOCATION_AREA_OPTIONS } from '../areaOptions.constants';
import {
  newCoordinate,
  isValidLatitude,
  isValidLongitude,
  createGeometryAndGraphic,
  extractCoordinates,
  addCoordinateTextFromPolygon,
} from './polygonCoordinates.utils';
import './PolygonCoordinatesInput.scss';

const PolygonCoordinatesInput = ({
  mapView,
  sketchViewModel,
  setGeometry,
  setSketchViewModel,
  measurementUnit,
  setMeasurementUnit,
  geomFromMap, // geometry coming from "add location" option in the map
}) => {
  const [selectedAreaRadioOption, setSelectedAreaRadioOption] = useState(
    NEW_LOCATION_AREA_OPTIONS.SMALL.id
  );
  const [coordinates, setCoordinates] = useState([newCoordinate()]);
  // coordinates backup to use when the user opens the modal, modifies the data and then cancels
  const [previousCoordinates, setPreviousCoordinates] = useState([]);

  const [customArea, setCustomArea] = useState();
  const [isPolygon, setIsPolygon] = useState(false);
  const [previousIsPolygon, setPreviousIsPolygon] = useState(false);

  const [open, setOpen] = useState(false);

  const addGraphicToMap = (geometryToAdd, graphic) => {
    mapView.graphics.removeAll();
    sketchViewModel?.delete();

    mapView.graphics.add(graphic);

    setTimeout(() => {
      mapView.goTo(
        {
          target: graphic,
        },
        { duration: 1000 }
      );
    }, 500);
    setGeometry(geometryToAdd);
    setOpen(false);
  };

  const updateGeometry = (geometry) => {
    const initialCoordinates = extractCoordinates(geometry);
    if (initialCoordinates.length > 0) {
      setIsPolygon(true);
      setCoordinates(initialCoordinates);
      setGeometry(geometry);
    }
  };

  useEffect(() => {
    if (geomFromMap) {
      const initialCoordinates = extractCoordinates(geomFromMap);
      if (initialCoordinates.length > 0) {
        setIsPolygon(true);
        setCoordinates(initialCoordinates);

        const { geometry, graphic } = createGeometryAndGraphic({
          coordinates: initialCoordinates,
          isPolygon: true,
        });

        addGraphicToMap(geometry, graphic);
      }
    }
  }, [geomFromMap]);

  const switchInputType = (isPolygonTabSelected) => {
    setIsPolygon(isPolygonTabSelected);

    if (isPolygonTabSelected) {
      // Set the coordinates to have three rows
      setCoordinates([newCoordinate(), newCoordinate(), newCoordinate()]);
    } else {
      // Set the coordinates to have one row
      setCoordinates([newCoordinate()]);
    }
  };

  const onCoordinatesChange = (event, id, field) => {
    const stringValue = event.target.value;
    const floatValue = parseFloat(stringValue);
    const error =
      field === 'latitude' ? !isValidLatitude(floatValue) : !isValidLongitude(floatValue);

    const updatedCoordinates = coordinates.map((coord) => {
      if (coord.id === id) {
        return { ...coord, [field]: stringValue, errors: { ...coord.errors, [field]: error } };
      }
      return coord;
    });

    setCoordinates(updatedCoordinates);
  };

  const handleOpen = () => {
    if (previousCoordinates.length) {
      setPreviousCoordinates(coordinates);
      setPreviousIsPolygon(isPolygon);
      mapView.graphics.removeAll();
      const { geometry, graphic } = createGeometryAndGraphic({
        coordinates,
        isPolygon,
      });
      addGraphicToMap(geometry, graphic);
    }
    setOpen(true);
  };

  const handleClose = () => {
    if (previousCoordinates.length) {
      setCoordinates(previousCoordinates);
      setIsPolygon(previousIsPolygon);
    }
    setOpen(false);
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
    if (!isPolygon) {
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
    const { geometry, graphic } = createGeometryAndGraphic({
      coordinates,
      isPolygon,
      selectedAreaRadioOption,
      measurementUnit,
      customArea,
    });
    addGraphicToMap(geometry, graphic);
    addCoordinateTextFromPolygon(geometry, mapView);
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

  // only show the edit coordinates button if there are coordinates
  const isEditButtonShown = !!coordinates?.[0]?.latitude;

  return (
    <div>
      <div className="draw-shape__button-group">
        <button
          className="draw-shape__draw-button"
          onClick={handleOpen}
          data-testid="polygon-coordinates-button"
        >
          <AddLocationIcon />
          <span>Add coordinates</span>
        </button>

        <LocationMapDrawer
          mapView={mapView}
          sketchViewModel={sketchViewModel}
          setSketchViewModel={setSketchViewModel}
          updateGeometry={updateGeometry}
        />
      </div>
      {isEditButtonShown && (
        <div className="draw-shape__button-group" style={{ right: '1rem', left: 'auto' }}>
          <GfwButton onClick={handleOpen} value="EDIT COORDINATES" />
        </div>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        data-testid="polygon-coordinates-modal"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          zIndex: 9999,
        }}
      >
        <Card className="polygon-coordinates">
          <CoordinateInputsContainer
            isPolygon={isPolygon}
            switchInputType={switchInputType}
            coordinates={coordinates}
            onCoordinatesChange={onCoordinatesChange}
            onDeleteCoordinate={onDeleteCoordinate}
            onAddCoordinate={onAddCoordinate}
          />
          {!isPolygon && (
            <SetArea
              selectedAreaRadioOption={selectedAreaRadioOption}
              setSelectedAreaRadioOption={setSelectedAreaRadioOption}
              measurementUnit={measurementUnit}
              setMeasurementUnit={setMeasurementUnit}
              customArea={customArea}
              setCustomArea={setCustomArea}
            />
          )}
          <div className="polygon-coordinates__actions">
            <Button variant="text" style={{ color: 'gray' }} onClick={handleClose}>
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
