import React, { useState } from 'react';
import './index.scss';

import { Typography, Card, IconButton, TextField, Divider, Radio } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import { HowToFormatLocationLink } from '../components/HowToFormatLocationLink';
import { useUploadType } from '../hooks/UploadTypeContext';

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

export function UploadLocationByPoint() {
  const [locationFormat, setLocationFormat] = useState<LocationFormat>(LocationFormat.COORDINATES);

  const [selectedRadiusSize, setSelectedRadiusSize] = useState<RadiusSize>(RadiusSize.SMALL);

  const { clearUploadType } = useUploadType();

  const getButtonClassName = (locFormat: LocationFormat) => {
    return `upload-location-by-point__location-info__location-type-button ${
      locationFormat === locFormat
        ? 'upload-location-by-point__location-info__location-type-button--selected'
        : ''
    }`;
  };

  return (
    <div className="upload-location-by-point">
      <nav>
        <IconButton onClick={clearUploadType} disableRipple>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">New Location</Typography>
      </nav>

      <Card>
        <Typography variant="h6">Prepare your location</Typography>
        <Typography variant="body2" className="upload-location-by-point__subtitle">
          GFW Pro allows to create location data for analysis by defining a point and radius with
          one of the methods below.
        </Typography>
        <HowToFormatLocationLink text="How to format your location data for GFW Pro" url="#" />

        <Typography variant="h6">Choose your location type</Typography>
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
            <Typography variant="h6">Enter coordinates</Typography>
            <Typography variant="body2" className="upload-location-by-point__subtitle">
              Coordinate data must be in decimal degrees format.
            </Typography>
            <div className="upload-location-by-point__location-info__coordinates">
              <TextField label="Latitude" variant="outlined" type="number" />
              <TextField label="Longitude" variant="outlined" type="number" />
            </div>

            <Divider flexItem sx={{ margin: '2rem 0 0.75rem' }} />

            <Typography variant="h6">Define radius around location</Typography>

            <div className="upload-location-by-point__location-info__radius-size-container">
              <div>
                <Radio
                  name="radius-size"
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

            <Divider flexItem sx={{ margin: '0.75rem 0 2rem' }} />

            {selectedRadiusSize === RadiusSize.CUSTOM && (
              <Typography variant="h6">Enter area (HA) or radius (km)</Typography>
            )}
          </form>
        </div>
      </Card>
    </div>
  );
}
