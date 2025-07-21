import { useEffect, useState } from 'react';
import { Typography, Card, TextField, Divider, Box } from '@mui/material';
import { AddLocationAlt, LocationOn, Close, ArrowForwardIos } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useHistory } from '../hooks';
import { LocationTypeButton, NavBar, AddressSelector } from '../components';
import HectareKilometerSwitch from '../../adding/HectareKilometerSwitch';
import { ExternalHelperResource, PillButton } from '../../../../../components';
import { MeasurementUnit, UploadType } from '../types';
import { coordinateSchema, locationNameSchema } from '../utils/schema';
import { useUploadLocation } from '../contexts';
import { DATA_CY, ExternalLinks } from '../../../../../utils/constants';

enum LocationFormat {
  Coordinates,
  Address,
}

const uploadByPointSchema = coordinateSchema.extend({
  locationName: locationNameSchema,
  areaSize: z
    .string()
    .nonempty({ message: 'Enter the area size' })
    .transform((val) => Number(val))
    .refine((val) => val > 0, { message: 'Enter a valid area size' })
    .transform((val) => val.toString()),
  areaMeasurementUnit: z.enum(['hectares', 'kilometers']),
});

type FormFields = z.infer<typeof uploadByPointSchema>;

export function UploadLocationByPoint() {
  const history = useHistory();
  const { clearUploadType, setUploadLocationByPoint } = useUploadLocation();
  const [locationFormat, setLocationFormat] = useState<LocationFormat | null>(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
    register,
    setValue,
  } = useForm<FormFields>({
    resolver: zodResolver(uploadByPointSchema),
    defaultValues: {
      areaMeasurementUnit: 'hectares',
      areaSize: '',
      latitude: '',
      longitude: '',
      locationName: '',
    },
  });
  useEffect(() => {
    setValue('latitude', '');
    setValue('longitude', '');
  }, [locationFormat]);

  const measurementSuggestedAreas = {
    hectares: [
      '785,000 hectares for palm oil mills',
      '283,000 hectares for soy silos',
      '80-102,000 hectares for cocoa warehouses',
    ],
    kilometers: [
      '50 km for palm oil mills',
      '30 km for soy silos',
      '0.5-18 km for cocoa warehouses',
    ],
  };

  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('hectares');

  const handleClearAddress = () => {
    setValue('latitude', '');
    setValue('longitude', '');
  };

  const handleAddressSelected = (latitude: number, longitude: number) => {
    setValue('latitude', latitude.toString());
    setValue('longitude', longitude.toString());
  };

  const onSubmit = (data: FormFields) => {
    setUploadLocationByPoint({
      locationName: data.locationName,
      coordinate: {
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
      },
      area: { size: Number(data.areaSize), measurementUnit: data.areaMeasurementUnit },
    });
    history.push('CONFIGURE_LIST');
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
        <ExternalHelperResource
          text="How to define point and radius data on GFW Pro"
          url={ExternalLinks.UploadListHelpCenter}
          color="info"
        />

        <Box sx={{ display: 'flex', gap: 0.75, mt: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: '500' }}>
            Name your location
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: '500', color: 'error.main' }}>
            *
          </Typography>
        </Box>

        <TextField
          size="small"
          fullWidth
          error={!!errors.locationName}
          helperText={errors.locationName?.message}
          {...register('locationName')}
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
              onClick={() => setLocationFormat(LocationFormat.Coordinates)}
            >
              <AddLocationAlt sx={{ fontSize: (theme) => theme.typography.h4 }} />
              <Typography variant="body2">Enter coordinates</Typography>
            </LocationTypeButton>
            <LocationTypeButton
              variant="outlined"
              color={locationFormat === LocationFormat.Address ? 'primary' : 'info'}
              onClick={() => setLocationFormat(LocationFormat.Address)}
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
                          error={!!errors.latitude}
                          helperText={errors.latitude?.message}
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
                          helperText={errors.longitude?.message}
                          {...field}
                        />
                      )}
                    />
                  </Box>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', gap: 0.75, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                      Enter address
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: '500', color: 'error.main' }}>
                      *
                    </Typography>
                  </Box>
                  <AddressSelector
                    onResultSelect={handleAddressSelected}
                    onClearValue={handleClearAddress}
                    error={errors.latitude}
                  />
                </>
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
                  <TextField
                    variant="outlined"
                    type="number"
                    size="small"
                    sx={{ flex: 1 }}
                    error={!!errors.areaSize}
                    helperText={errors.areaSize?.message}
                    data-testid="area-size"
                    {...register('areaSize')}
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
                      {measurementSuggestedAreas[measurementUnit].map((suggestedArea) => (
                        <li>{suggestedArea}</li>
                      ))}
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
                data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByPoint].LOCATION_CANCEL}
                onClick={clearUploadType}
              >
                Cancel
              </PillButton>
              <PillButton
                type="submit"
                variant="contained"
                startIcon={<ArrowForwardIos />}
                disabled={locationFormat === null}
                data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByPoint].LOCATION_NEXT}
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
