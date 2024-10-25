import React, { useState } from 'react';
import './index.scss';

import {
  Typography,
  Card,
  IconButton,
  TextField,
  Divider,
  Radio,
  OutlinedInput,
  InputAdornment,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';

import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { HowToFormatLocationLink } from '../components/HowToFormatLocationLink';

import HectareKilometerSwitch from '../../adding/HectareKilometerSwitch';
import { NavBarWithProgress } from '../components/NavBarWithProgress';

enum LocationFormat {
  COORDINATES,
  ADDRESS,
}
enum RadiusSize {
  SMALL,
  MEDIUM,
  LARGE,
  CUSTOM,
}

type UploadLocationByPointProps = {
  clearUploadType: () => void;
};

export function UploadLocationByPoint({ clearUploadType }: UploadLocationByPointProps) {
  const [locationFormat, setLocationFormat] = useState<LocationFormat>(LocationFormat.COORDINATES);

  const [selectedRadiusSize, setSelectedRadiusSize] = useState<RadiusSize>(RadiusSize.SMALL);

  const [measurementUnit, setMeasurementUnit] = useState('hectares');

  const getButtonClassName = (locFormat: LocationFormat) => {
    return `upload-location-by-point__location-info__location-type-button ${
      locationFormat === locFormat
        ? 'upload-location-by-point__location-info__location-type-button--selected'
        : ''
    }`;
  };

  const steps = ['Location', 'Configure List', 'Submit'];
  const [activeStep] = React.useState(0);

  return (
    <div className="upload-location-by-point">
      <NavBarWithProgress clearUploadType={clearUploadType} steps={steps} activeStep={activeStep} />

      <Card>
        <Typography variant="h6">Prepare your location</Typography>
        <Typography variant="body2" className="upload-location-by-point__subtitle">
          GFW Pro allows to create location data for analysis by defining a point and radius with
          one of the methods below.
        </Typography>
        <HowToFormatLocationLink text="How to format your location data for GFW Pro" url="#" />

        <Typography variant="h6" sx={{ marginTop: '1rem' }}>
          Choose your location type
        </Typography>
        <Typography variant="body2" className="upload-location-by-point__subtitle">
          Choose one of the options below based on your preferred location format.
        </Typography>

        <div className="upload-location-by-point__location-info">
          <div>
            <button
              className={getButtonClassName(LocationFormat.COORDINATES)}
              onClick={() => setLocationFormat(LocationFormat.COORDINATES)}
            >
              <AddLocationAltIcon />
              <Typography>Enter coordinates</Typography>
            </button>
            <button
              className={getButtonClassName(LocationFormat.ADDRESS)}
              onClick={() => setLocationFormat(LocationFormat.ADDRESS)}
            >
              <LocationOnIcon />
              <Typography>Enter address</Typography>
            </button>
          </div>
          <form>
            {locationFormat === LocationFormat.COORDINATES ? (
              <>
                <Typography variant="h6">Enter coordinates</Typography>
                <Typography variant="body2" className="upload-location-by-point__subtitle">
                  Coordinate data must be in decimal degrees format.
                </Typography>
                <div className="upload-location-by-point__location-info__coordinates">
                  <TextField
                    label="Latitude"
                    variant="outlined"
                    type="number"
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Longitude"
                    variant="outlined"
                    type="number"
                    fullWidth
                    size="small"
                  />
                </div>
              </>
            ) : (
              <>
                <Typography variant="h6">Enter address</Typography>

                <FormControl
                  variant="outlined"
                  className="upload-location-by-point__location-info__address-text-field"
                >
                  <InputLabel htmlFor="outlined-adornment-password">Address</InputLabel>
                  <OutlinedInput
                    id="address"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton disableRipple>
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Address"
                  />
                </FormControl>
              </>
            )}

            <Divider flexItem sx={{ margin: '2rem 0 0.75rem' }} />

            <Typography variant="h6">Define radius around location</Typography>

            <div className="upload-location-by-point__location-info__radius-size-container">
              <div>
                <Radio
                  name="radius-size"
                  color="primary"
                  value={RadiusSize.SMALL}
                  checked={selectedRadiusSize === RadiusSize.SMALL}
                  onClick={() => setSelectedRadiusSize(RadiusSize.SMALL)}
                />
                <div>
                  <label htmlFor="radius-small">Small</label>
                  <span>1000 hectares (1.78 km radius)</span>
                </div>
              </div>
              <div>
                <Radio
                  name="radius-size"
                  color="primary"
                  value={RadiusSize.MEDIUM}
                  checked={selectedRadiusSize === RadiusSize.MEDIUM}
                  onClick={() => setSelectedRadiusSize(RadiusSize.MEDIUM)}
                />
                <div>
                  <label htmlFor="radius-medium">Medium</label>
                  <span>5000 hectares (3.99 km radius)</span>
                </div>
              </div>

              <div>
                <Radio
                  name="radius-size"
                  color="primary"
                  value={RadiusSize.LARGE}
                  checked={selectedRadiusSize === RadiusSize.LARGE}
                  onClick={() => setSelectedRadiusSize(RadiusSize.LARGE)}
                />
                <div>
                  <label htmlFor="radius-large">Large</label>
                  <span>20,000 hectares (7.98 km radius)</span>
                </div>
              </div>
              <div>
                <Radio
                  name="radius-size"
                  color="primary"
                  value={RadiusSize.CUSTOM}
                  checked={selectedRadiusSize === RadiusSize.CUSTOM}
                  onClick={() => setSelectedRadiusSize(RadiusSize.CUSTOM)}
                />
                <div>
                  <label htmlFor="radius-custom">Custom</label>
                  <span>Define the area (in HA) or radius (in KM)</span>
                </div>
              </div>
            </div>

            {selectedRadiusSize === RadiusSize.CUSTOM && (
              <>
                <Divider flexItem sx={{ margin: '1.5rem 0 2rem' }} />
                <Typography variant="h6">Enter area (HA) or radius (km)</Typography>
                <div className="upload-location-by-point__location-info__custom-area-container">
                  <TextField
                    label="Custom area"
                    variant="outlined"
                    type="number"
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <HectareKilometerSwitch
                    measurementUnit={measurementUnit}
                    setMeasurementUnit={setMeasurementUnit}
                  />
                  <div className="upload-location-by-point__location-info__custom-area-container__suggestions-container">
                    <Typography>Suggested areas:</Typography>
                    <ul>
                      <li>785,000 hectares for palm oil mills</li>
                      <li>283,000 hectares for soy silos</li>
                      <li>80-102,000 hectares for cocoa warehouses</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            <div className="upload-location-by-point__location-info__bottom-buttons-container">
              <Button
                variant="contained"
                color="info"
                startIcon={<CloseIcon />}
                onClick={clearUploadType}
              >
                Cancel
              </Button>
              <Button variant="contained" startIcon={<ArrowForwardIosIcon />}>
                Next
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
