import React, { useState } from 'react';
import {
  Typography,
  Card,
  IconButton,
  TextField,
  Divider,
  OutlinedInput,
  InputAdornment,
  FormControl,
  InputLabel,
  Box,
  FormHelperText,
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

const sharedFields = z.object({
  areaSize: z.coerce.number().nonnegative(),
  areaMeasurementUnit: z.enum(['hectares', 'kilometers']),
  locationName: z.string(),
});

const uploadByPointSchema = z.discriminatedUnion('locationFormat', [
  coordinateSchema
    .extend({
      locationFormat: z.literal(LocationFormat.Coordinates),
    })
    .merge(sharedFields),
  z
    .object({
      locationFormat: z.literal(LocationFormat.Address),
      address: z.string().trim().min(1, 'Address cannot be empty'),
    })
    .merge(sharedFields),
  z.object({
    locationFormat: z.null(),
  }),
]);
type FormFields = z.infer<typeof uploadByPointSchema>;

const COORDINATE_ERROR_MESSAGE =
  'Your coordinate value is invalid. Please ensure your data is in decimal degree notation';

export function UploadLocationByPoint() {
  const history = useHistory();
  const { clearUploadType, setUploadLocationByPointAddress, setUploadLocationByPointCoordinates } =
    useUploadLocation();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormFields>({
    resolver: zodResolver(uploadByPointSchema),
    defaultValues: { locationFormat: null },
  });

  const locationFormat: LocationFormat | null = watch('locationFormat');

  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('hectares');

  const handleChangeLocationFormat = (locFormat: LocationFormat) => {
    if (locFormat === LocationFormat.Coordinates) {
      reset({ locationFormat: locFormat, latitude: '', longitude: '' });
    } else {
      reset({ locationFormat: locFormat, address: '' });
    }
  };

  const onSubmit = (data: FormFields) => {
    if (!data.locationFormat === null) {
      return;
    }

    if (data.locationFormat === LocationFormat.Address) {
      setUploadLocationByPointAddress({
        locationName: data.locationName,
        address: data.address,
        area: { size: data.areaSize, measurementUnit: data.areaMeasurementUnit },
      });
      history.push('CONFIGURE_LIST');
    } else if (data.locationFormat === LocationFormat.Coordinates) {
      setUploadLocationByPointCoordinates({
        locationName: data.locationName,
        coordinate: { latitude: data.latitude, longitude: data.longitude },
        area: { size: data.areaSize, measurementUnit: data.areaMeasurementUnit },
      });
      history.push('CONFIGURE_LIST');
    }
  };

  return (
    <>
      <NavBar />
      <Card sx={{ pt: 1, px: 2, pb: 2 }}>
        <Typography variant="h6">Prepare your location</Typography>
        <Typography
          variant="caption"
          sx={{ display: 'inline-block', mt: 0.75, mx: 0, mb: 1.5, color: 'text.secondary' }}
        >
          GFW Pro allows to create location data for analysis by defining a point and radius with
          one of the methods below.
        </Typography>
        <ExternalHelperResource text="How to format your location data for GFW Pro" url="#" />

        <Box sx={{ display: 'flex', gap: 0.75, mt: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: '500' }}>
            Name your location
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: '500', color: 'error.main' }}>
            *
          </Typography>
        </Box>

        <Controller
          name="locationName"
          control={control}
          render={({ field }) => {
            return (
              <TextField
                size="small"
                placeholder="Location name"
                fullWidth
                error={'locationName' in errors && !!errors.locationName}
                helperText={
                  'locationName' in errors && errors.locationName ? 'Enter the location name' : ''
                }
                {...field}
              />
            );
          }}
        />

        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Choose your location type
        </Typography>
        <Typography variant="caption" sx={{ mt: 0.75, mx: 0, mb: 1.5, color: 'text.secondary' }}>
          Choose one of the options below based on your preferred location format.
        </Typography>

        <Box sx={{ display: { sm: 'flex', xs: 'block' }, gap: 3, mt: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              mb: 1.5,
              minWidth: '220px',
            }}
          >
            <LocationTypeButton
              variant="outlined"
              color={locationFormat === LocationFormat.Coordinates ? 'primary' : 'info'}
              onClick={() => handleChangeLocationFormat(LocationFormat.Coordinates)}
            >
              <AddLocationAlt sx={{ fontSize: (theme) => theme.typography.h4 }} />
              <Typography variant="body2">Enter coordinates</Typography>
            </LocationTypeButton>
            <LocationTypeButton
              variant="outlined"
              color={locationFormat === LocationFormat.Address ? 'primary' : 'info'}
              onClick={() => handleChangeLocationFormat(LocationFormat.Address)}
            >
              <LocationOn sx={{ fontSize: (theme) => theme.typography.h4 }} />
              <Typography variant="body2">Enter address</Typography>
            </LocationTypeButton>
          </Box>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ flex: '1' }}>
            <Box sx={{ visibility: locationFormat === null ? 'hidden' : 'initial' }}>
              {locationFormat === LocationFormat.Coordinates ? (
                <Box>
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                      Enter coordinates
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: '500', color: 'error.main' }}>
                      *
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{ display: 'inline-block', mb: 2, color: 'text.secondary' }}
                  >
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
                          error={'latitude' in errors && !!errors.latitude}
                          helperText={
                            'latitude' in errors && errors.latitude ? COORDINATE_ERROR_MESSAGE : ''
                          }
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
                          error={'longitude' in errors && !!errors.longitude}
                          helperText={
                            'longitude' in errors && errors.longitude
                              ? COORDINATE_ERROR_MESSAGE
                              : ''
                          }
                          {...field}
                        />
                      )}
                    />
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', gap: 0.75, mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                      Enter address
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: '500', color: 'error.main' }}>
                      *
                    </Typography>
                  </Box>
                  <Controller
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <FormControl
                        variant="outlined"
                        size="small"
                        fullWidth
                        error={'address' in errors && !!errors.address}
                      >
                        <InputLabel htmlFor="address">Address</InputLabel>
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
                          {...field}
                        />
                        {'address' in errors && !!errors.address && (
                          <FormHelperText>Enter the address</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
              )}

              <Box>
                <Divider flexItem sx={{ mt: 3, mb: 4 }} />
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: '500' }}>
                    Define radius around location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: '500', color: 'error.main' }}>
                    *
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ mb: 2, color: 'text.secondary' }}>
                  Enter area (Ha) or radius (Km)
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { sm: 'row', xs: 'column' },
                    gap: { sm: 2, xs: 1 },
                    mt: 2,
                  }}
                >
                  <Controller
                    control={control}
                    name="areaSize"
                    render={({ field }) => (
                      <TextField
                        label="Custom area"
                        variant="outlined"
                        type="number"
                        size="small"
                        sx={{ flex: 1 }}
                        error={'areaSize' in errors && !!errors.areaSize}
                        helperText={
                          'areaSize' in errors && errors.areaSize ? 'Enter the area size' : ''
                        }
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="areaMeasurementUnit"
                    defaultValue="hectares"
                    render={({ field }) => (
                      <HectareKilometerSwitch
                        measurementUnit={measurementUnit}
                        setMeasurementUnit={(value: MeasurementUnit) => {
                          setMeasurementUnit(value);
                          field.onChange(value);
                        }}
                      />
                    )}
                  />
                  <Box
                    sx={{
                      backgroundColor: 'background.default',
                      p: 1.5,
                      borderRadius: 2,
                      width: { sm: '400px', xs: '100%' },
                    }}
                  >
                    <Typography>Suggested areas:</Typography>
                    <Box
                      component="ul"
                      sx={{
                        paddingLeft: 3,
                        marginTop: 0.5,
                        color: 'text.secondary',
                      }}
                    >
                      <li>785,000 {measurementUnit} for palm oil mills</li>
                      <li>283,000 {measurementUnit} for soy silos</li>
                      <li>80-102,000 {measurementUnit} for cocoa warehouses</li>
                    </Box>
                  </Box>
                </Box>
              </Box>
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
          </Box>
        </Box>
      </Card>
    </>
  );
}
