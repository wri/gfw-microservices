import React, { useState } from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import Modal from '@mui/material/Modal';
import { default as GfwButton } from '../../../../../common/js/components/Button';
import CoordinateInputsContainer from './CoordinateInputsContainer';
import RadiusOptions from './RadiusOptions';
import './PolygonCoordinatesInput.scss';

const PolygonCoordinatesInput = () => {
  const [selectedRadius, setSelectedRadius] = useState('big');
  const [coordinates, setCoordinates] = useState([{ id: 0, lat: 0, long: 2 }]);
  const [customRadiusSize, setCustomRadiusSize] = useState();
  const [areaUnit, setAreaUnit] = useState('ha');
  const [open, setOpen] = useState(false);

  const onlyOneCorodinatesRow = coordinates.length === 1;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onCoordinatesChange = (event, index, field) => {
    const result = coordinates.map((row) =>
      row.id === index ? { ...row, [field]: event.target.value } : row
    );

    setCoordinates(result);
  };

  const onDeleteCoordinate = (index) => {
    if (onlyOneCorodinatesRow) {
      // user can't delete the coordinates if there is only one row
      return;
    }
    const filteredCoordinates = coordinates.filter((coord) => coord.id !== index);
    setCoordinates(filteredCoordinates);
  };

  return (
    <div>
      <Button style={{ position: 'absolute', zIndex: 100 }} onClick={handleOpen}>
        <AddLocationIcon />
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
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
            style={{ float: 'right' }}
            onClick={() => {
              setOpen(false);
              console.log({
                coordinates,
                selectedRadius,
                customRadiusSize,
                areaUnit,
              });
            }}
          >
            OK
          </GfwButton>
        </Card>
      </Modal>
    </div>
  );
};

export default PolygonCoordinatesInput;
