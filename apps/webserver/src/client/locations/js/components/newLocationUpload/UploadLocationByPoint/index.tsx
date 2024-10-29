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
  Box,
} from '@mui/material';

import { AddLocationAlt, LocationOn, Search, Close, ArrowForwardIos } from '@mui/icons-material';

import { NavBarWithProgress, LocationTypeButton, HowToFormatLocationLink } from '../components';

import HectareKilometerSwitch from '../../adding/HectareKilometerSwitch';
import { PillButton } from '../../../../../components';

enum LocationFormat {
  Coordinates,
  Address,
}
enum RadiusSize {
  Small,
  Medium,
  Large,
  Custom,
}

type UploadLocationByPointProps = {
  clearUploadType: () => void;
};

export function UploadLocationByPoint({ clearUploadType }: UploadLocationByPointProps) {
  const [locationFormat, setLocationFormat] = useState<LocationFormat>(LocationFormat.Coordinates);

  const [selectedRadiusSize, setSelectedRadiusSize] = useState<RadiusSize>(RadiusSize.Small);

  const [measurementUnit, setMeasurementUnit] = useState('hectares');

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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <LocationTypeButton
              variant="outlined"
              color={locationFormat === LocationFormat.Coordinates ? 'primary' : 'info'}
              onClick={() => setLocationFormat(LocationFormat.Coordinates)}
            >
              <AddLocationAlt fontSize="medium" />
              <Typography variant="body2">Enter coordinates</Typography>
            </LocationTypeButton>
            <LocationTypeButton
              variant="outlined"
              color={locationFormat === LocationFormat.Address ? 'primary' : 'info'}
              onClick={() => setLocationFormat(LocationFormat.Address)}
            >
              <LocationOn fontSize="medium" />
              <Typography variant="body2">Enter address</Typography>
            </LocationTypeButton>
          </Box>
          <form>
            {locationFormat === LocationFormat.Coordinates ? (
              <>
                <Typography variant="h6">Enter coordinates</Typography>
                <div className="upload-location-by-point__location-info__coordinates">
                  <TextField
                    label="Latitude"
                    variant="outlined"
                    type="number"
                    fullWidth
                    size="small"
                    helperText="It must be in decimal degrees format"
                  />
                  <TextField
                    label="Longitude"
                    variant="outlined"
                    type="number"
                    fullWidth
                    size="small"
                    helperText="It must be in decimal degrees format"
                  />
                </div>
              </>
            ) : (
              <>
                <Typography variant="h6">Enter address</Typography>

                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel htmlFor="outlined-adornment-password">Address</InputLabel>
                  <OutlinedInput
                    id="address"
                    sx={{
                      '& input': {
                        borderRight: 'none',
                        '&:focus': {
                          boxShadow: 'none',
                        },
                      },
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton disableRipple>
                          <Search />
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
                  value={RadiusSize.Small}
                  checked={selectedRadiusSize === RadiusSize.Small}
                  onClick={() => setSelectedRadiusSize(RadiusSize.Small)}
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
                  value={RadiusSize.Medium}
                  checked={selectedRadiusSize === RadiusSize.Medium}
                  onClick={() => setSelectedRadiusSize(RadiusSize.Medium)}
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
                  value={RadiusSize.Large}
                  checked={selectedRadiusSize === RadiusSize.Large}
                  onClick={() => setSelectedRadiusSize(RadiusSize.Large)}
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
                  value={RadiusSize.Custom}
                  checked={selectedRadiusSize === RadiusSize.Custom}
                  onClick={() => setSelectedRadiusSize(RadiusSize.Custom)}
                />
                <div>
                  <label htmlFor="radius-custom">Custom</label>
                  <span>Define the area (in HA) or radius (in KM)</span>
                </div>
              </div>
            </div>

            {selectedRadiusSize === RadiusSize.Custom && (
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
              <PillButton
                variant="contained"
                color="info"
                startIcon={<Close />}
                onClick={clearUploadType}
              >
                Cancel
              </PillButton>
              <PillButton variant="contained" startIcon={<ArrowForwardIos />}>
                Next
              </PillButton>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
