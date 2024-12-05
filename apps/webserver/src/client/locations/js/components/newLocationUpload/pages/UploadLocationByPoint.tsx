import React, { useState } from 'react';
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
  useTheme,
} from '@mui/material';
import { AddLocationAlt, LocationOn, Search, Close, ArrowForwardIos } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useHistory } from '../hooks';
import { LocationTypeButton, ExternalHelperResource, NavBar } from '../components';
import HectareKilometerSwitch from '../../adding/HectareKilometerSwitch';
import { PillButton } from '../../../../../components';
import { MeasurementUnit } from '../types';
import { coordinateSchema } from '../utils/schema';
import { useUploadLocation } from '../contexts';

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

type FormFields = z.infer<typeof coordinateSchema>;

const COORDINATE_ERROR_MESSAGE =
  'Your coordinate value is invalid. Please ensure your data is in decimal degree notation';

export function UploadLocationByPoint() {
  const theme = useTheme();
  const history = useHistory();

  const { clearUploadType } = useUploadLocation();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormFields>({
    resolver: zodResolver(coordinateSchema),
    defaultValues: {
      latitude: '',
      longitude: '',
    },
  });
  const [locationFormat, setLocationFormat] = useState<LocationFormat | null>(null);

  const [selectedRadiusSize, setSelectedRadiusSize] = useState<RadiusSize>(RadiusSize.Small);

  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('hectares');

  const handleChangeLocationFormat = (locFormat: LocationFormat) => {
    setLocationFormat(locFormat);
    reset();
  };

  const onSubmit = (data: FormFields) => {
    console.log({ data });
    history.push('CONFIGURE_LIST');
  };

  return (
    <>
      <NavBar />
      <Card sx={{ pt: 1, px: 2, pb: 2 }}>
        <Typography variant="h6">Prepare your location</Typography>
        <Typography variant="body2" sx={{ mt: 0.75, mx: 0, mb: 1.5 }}>
          GFW Pro allows to create location data for analysis by defining a point and radius with
          one of the methods below.
        </Typography>
        <ExternalHelperResource text="How to format your location data for GFW Pro" url="#" />

        <Typography variant="h6" sx={{ mt: 2 }}>
          Choose your location type
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.75, mx: 0, mb: 1.5 }}>
          Choose one of the options below based on your preferred location format.
        </Typography>

        <Box sx={{ display: { sm: 'flex', xs: 'block' }, gap: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              mb: 1.5,
              minWidth: '260px',
            }}
          >
            <LocationTypeButton
              variant="outlined"
              color={locationFormat === LocationFormat.Coordinates ? 'primary' : 'info'}
              onClick={() => handleChangeLocationFormat(LocationFormat.Coordinates)}
            >
              <AddLocationAlt fontSize="medium" />
              <Typography variant="body2">Enter coordinates</Typography>
            </LocationTypeButton>
            <LocationTypeButton
              variant="outlined"
              color={locationFormat === LocationFormat.Address ? 'primary' : 'info'}
              onClick={() => handleChangeLocationFormat(LocationFormat.Address)}
            >
              <LocationOn fontSize="medium" />
              <Typography variant="body2">Enter address</Typography>
            </LocationTypeButton>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)} style={{ flex: '1' }}>
            <Box sx={{ visibility: locationFormat === null ? 'hidden' : 'initial' }}>
              {locationFormat === LocationFormat.Coordinates ? (
                <Box>
                  <Typography variant="h6">Enter coordinates</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Coordinate data must be in decimal degrees format.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Controller
                      name="latitude"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label="Latitude"
                          variant="outlined"
                          type="number"
                          fullWidth
                          size="small"
                          error={!!errors.latitude}
                          helperText={errors.latitude ? COORDINATE_ERROR_MESSAGE : ''}
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="longitude"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label="Longitude"
                          variant="outlined"
                          type="number"
                          fullWidth
                          size="small"
                          error={!!errors.longitude}
                          helperText={errors.longitude ? COORDINATE_ERROR_MESSAGE : ''}
                          {...field}
                        />
                      )}
                    />
                  </Box>
                </Box>
              ) : (
                <Box>
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
                </Box>
              )}

              <Divider flexItem sx={{ mt: 4, mb: 1.5 }} />

              <Typography variant="h6">Define radius around location</Typography>

              <Box
                sx={{ display: { sm: 'grid', xs: 'block' }, gridTemplateColumns: 'repeat(2, 1fr)' }}
              >
                <Box sx={{ display: 'flex' }}>
                  <Radio
                    name="radius-size"
                    color="primary"
                    value={RadiusSize.Small}
                    checked={selectedRadiusSize === RadiusSize.Small}
                    onClick={() => setSelectedRadiusSize(RadiusSize.Small)}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label htmlFor="radius-small">Small</label>
                    <Typography variant="caption">1000 hectares (1.78 km radius)</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Radio
                    name="radius-size"
                    color="primary"
                    value={RadiusSize.Medium}
                    checked={selectedRadiusSize === RadiusSize.Medium}
                    onClick={() => setSelectedRadiusSize(RadiusSize.Medium)}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label htmlFor="radius-medium">Medium</label>
                    <Typography variant="caption">5000 hectares (3.99 km radius)</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex' }}>
                  <Radio
                    name="radius-size"
                    color="primary"
                    value={RadiusSize.Large}
                    checked={selectedRadiusSize === RadiusSize.Large}
                    onClick={() => setSelectedRadiusSize(RadiusSize.Large)}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label htmlFor="radius-large">Large</label>
                    <Typography variant="caption">20,000 hectares (7.98 km radius)</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Radio
                    name="radius-size"
                    color="primary"
                    value={RadiusSize.Custom}
                    checked={selectedRadiusSize === RadiusSize.Custom}
                    onClick={() => setSelectedRadiusSize(RadiusSize.Custom)}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label htmlFor="radius-custom">Custom</label>
                    <Typography variant="caption">
                      Define the area (in HA) or radius (in KM)
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {selectedRadiusSize === RadiusSize.Custom && (
                <Box>
                  <Divider flexItem sx={{ mt: 3, mb: 4 }} />
                  <Typography variant="h6">Enter area (HA) or radius (km)</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column' },
                      gap: { xs: 1, sm: 2 },
                      mt: 2,
                    }}
                  >
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
                    <Box
                      sx={{
                        backgroundColor: theme.palette.background.default,
                        p: 1.5,
                        borderRadius: 2,
                        width: { sm: '400px', xs: '100%' },
                      }}
                    >
                      <Typography>Suggested areas:</Typography>
                      <ul
                        style={{
                          paddingLeft: '1.5rem',
                          marginTop: '0.25rem',
                          color: theme.palette.text.secondary,
                        }}
                      >
                        <li>785,000 {measurementUnit} for palm oil mills</li>
                        <li>283,000 {measurementUnit} for soy silos</li>
                        <li>80-102,000 {measurementUnit} for cocoa warehouses</li>
                      </ul>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { sm: 'row', xs: 'column' },
                justifyContent: 'end',
                gap: 1,
                mt: 4,
              }}
            >
              <PillButton
                variant="contained"
                color="info"
                startIcon={<Close />}
                onClick={clearUploadType}
              >
                Cancel
              </PillButton>
              <PillButton
                type="submit"
                variant="contained"
                startIcon={<ArrowForwardIos />}
                disabled={locationFormat === null}
              >
                Next
              </PillButton>
            </Box>
          </form>
        </Box>
      </Card>
    </>
  );
}
