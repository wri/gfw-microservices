import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  Collapse,
  IconButton,
  List,
  ListItem,
  Skeleton,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AddLocationAlt,
  Close,
  ArrowForwardIos,
  Draw,
  Add,
  Check,
  Clear,
} from '@mui/icons-material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { TransitionGroup } from 'react-transition-group';

import { ExternalHelperResource, LocationTypeButton, NavBar } from '../components';
import { PillButton } from '../../../../../components';
import { coordinateSchema } from '../utils/schema';
import { createGeometryAndGraphic } from '../../adding/PolygonCoordinates/polygonCoordinates.utils';
import { useMap } from '../hooks';
import LocationMapDrawer from '../../adding/LocationMapDrawer';
import { useUploadLocation } from '../contexts';
import { useHistory } from '../hooks';

const MIN_AMOUNT_OF_COORDINATES = 3;
const MAX_AMOUNT_OF_COORDINATES = 10;

const COORDINATE_ERROR_MESSAGE =
  'Your coordinate value is invalid. Please ensure your data is in decimal degree notation';

enum LocationFormat {
  DrawAShape,
  PolygonCoordinates,
}

const uploadByPolygonSchema = z.object({
  coordinates: z.record(coordinateSchema),
  locationName: z.string(),
});

type FormFields = z.infer<typeof uploadByPolygonSchema>;

export function UploadLocationByPolygon() {
  const theme = useTheme();
  const history = useHistory();

  const { clearUploadType, setUploadLocationByPolygon } = useUploadLocation();
  const isRegularScreenSize = useMediaQuery(theme.breakpoints.up('sm'));

  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    setValue,
    reset,
  } = useForm<FormFields>({ resolver: zodResolver(uploadByPolygonSchema) });

  const [locationFormat, setLocationFormat] = useState<LocationFormat | null>(null);

  const {
    mapView,
    sketchViewModel,
    setSketchViewModel,
    updateGeometry,
    coordinates,
    setCoordinates,
    addGraphicToMap,
    generateEmptyCoordinate,
  } = useMap(locationFormat !== null, MIN_AMOUNT_OF_COORDINATES);

  const handleAddCoordinateField = () => {
    setCoordinates((prev) => [generateEmptyCoordinate(), ...prev]);
  };
  const handleRemoveCoordinateField = (id: string) => {
    setCoordinates((prev) => prev.filter((x) => x.id !== id));
  };
  const handleUpdateCoordinate = (id: string, key: string, value: string) => {
    setCoordinates((prev) => {
      return prev.map((item) => (item.id === id ? { ...item, [key]: value } : item));
    });
  };

  useEffect(() => {
    reset();

    coordinates.forEach(({ id, latitude, longitude }) => {
      setValue(`coordinates.${id}`, {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });
    });
  }, [coordinates]);

  const handleChangeLocationFormat = (locFormat: LocationFormat) => {
    setLocationFormat(locFormat);
  };

  const onSubmit = (data: FormFields) => {
    const coordinates: z.infer<typeof coordinateSchema>[] = [];

    for (const key in data.coordinates) {
      const { latitude, longitude } = data.coordinates[key];

      coordinates.push({ latitude, longitude });
    }

    const { geometry, graphic } = createGeometryAndGraphic({
      coordinates,
      isPolygon: true,
      selectedAreaRadioOption: null,
      measurementUnit: 'hectares',
      customArea: null,
    });
    addGraphicToMap(geometry, graphic);
  };

  const handleNextPage = () => {
    setUploadLocationByPolygon({ coordinates, locationName: getValues('locationName') });
    history.push('CONFIGURE_LIST');
  };

  const isLocationFormatInDrawAShape = locationFormat === LocationFormat.DrawAShape;
  const isLocationFormatInPolygonCoordinates = locationFormat === LocationFormat.PolygonCoordinates;

  return (
    <>
      <NavBar />
      <Card sx={{ pt: 1, pb: 2, px: 2 }}>
        <Typography variant="h6">Prepare your location</Typography>
        <Typography
          variant="caption"
          sx={{ display: 'inline-block', mt: 0.5, mb: 1, color: 'text.secondary' }}
        >
          GFW Pro allows users to create polygon data for analysis view drawing a boundary on the
          map or defining a polygon via its coordinates vertices.
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

        <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: '500' }}>
          Choose your location type
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Select draw a shape and start drawing or you can enter coordinates.
        </Typography>

        <Box
          sx={{ display: { sm: 'flex', xs: 'block' }, gap: 3, mt: 1.5, height: { sm: '470px' } }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              mb: { xs: 2 },
            }}
          >
            <LocationTypeButton
              variant="outlined"
              color={isLocationFormatInDrawAShape ? 'primary' : 'info'}
              onClick={() => handleChangeLocationFormat(LocationFormat.DrawAShape)}
              sx={{ maxWidth: { sm: '274px' } }}
            >
              <Draw sx={{ fontSize: (theme) => theme.typography.h4 }} />
              <Typography variant="body2">Draw a shape</Typography>
            </LocationTypeButton>
            {!isLocationFormatInPolygonCoordinates ? (
              <LocationTypeButton
                variant="outlined"
                color="info"
                onClick={() => handleChangeLocationFormat(LocationFormat.PolygonCoordinates)}
              >
                <AddLocationAlt sx={{ fontSize: (theme) => theme.typography.h4 }} />
                <Typography variant="body2">Enter polygon coordinates</Typography>
              </LocationTypeButton>
            ) : (
              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start',
                  gap: '0.5rem',
                  border: `2px solid ${theme.palette.primary.main}`,
                  borderRadius: '3px',
                  padding: '1.5rem 1rem',
                  width: isRegularScreenSize ? '440px' : '100%',
                  maxHeight: '430px',
                  overflow: 'auto',
                }}
              >
                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddLocationAlt sx={{ fontSize: (theme) => theme.typography.h4 }} />
                    <Typography variant="body2">Enter coordinates</Typography>
                  </Box>
                  <PillButton
                    startIcon={<Add style={{ color: theme.palette.primary.main }} />}
                    disabled={coordinates.length === MAX_AMOUNT_OF_COORDINATES}
                    onClick={handleAddCoordinateField}
                  >
                    Add
                  </PillButton>
                </Box>

                <List>
                  <TransitionGroup>
                    {coordinates.map(({ id, latitude, longitude }, index) => {
                      return (
                        <Collapse key={id}>
                          <ListItem
                            sx={{ display: 'flex', alignItems: 'start', gap: 1 }}
                            disableGutters
                          >
                            <Typography sx={{ minWidth: '1rem', marginTop: 1 }}>
                              {index + 1}
                            </Typography>
                            <Controller
                              name={`coordinates.${id}.latitude`}
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <TextField
                                  label="Latitude"
                                  variant="outlined"
                                  type="number"
                                  size="small"
                                  value={latitude}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleUpdateCoordinate(id, 'latitude', e.target.value);
                                  }}
                                  error={!!errors.coordinates?.[id]?.latitude}
                                  helperText={
                                    errors.coordinates?.[id]?.latitude
                                      ? COORDINATE_ERROR_MESSAGE
                                      : ''
                                  }
                                />
                              )}
                            />
                            <Controller
                              name={`coordinates.${id}.longitude`}
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <TextField
                                  label="Longitude"
                                  variant="outlined"
                                  type="number"
                                  size="small"
                                  value={longitude}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleUpdateCoordinate(id, 'longitude', e.target.value);
                                  }}
                                  error={!!errors.coordinates?.[id]?.longitude}
                                  helperText={
                                    errors.coordinates?.[id]?.longitude
                                      ? COORDINATE_ERROR_MESSAGE
                                      : ''
                                  }
                                />
                              )}
                            />
                            {coordinates.length > MIN_AMOUNT_OF_COORDINATES ? (
                              <IconButton
                                onClick={() => handleRemoveCoordinateField(id)}
                                disableRipple
                              >
                                <Clear />
                              </IconButton>
                            ) : (
                              <Box sx={{ width: 6, height: 6 }}></Box>
                            )}
                          </ListItem>
                        </Collapse>
                      );
                    })}
                  </TransitionGroup>
                </List>

                <PillButton
                  type="submit"
                  variant="contained"
                  sx={{ alignSelf: 'end', width: { sm: 'fit-content', xs: '100%' } }}
                  startIcon={<Check />}
                >
                  Ok
                </PillButton>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              position: 'relative',
              height: { xs: '470px' },
            }}
          >
            {mapView && isLocationFormatInDrawAShape && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 2,
                  left: 2,
                  zIndex: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'baseline',
                }}
              >
                <LocationMapDrawer
                  geomFromMap={null}
                  mapView={mapView}
                  sketchViewModel={sketchViewModel}
                  setSketchViewModel={setSketchViewModel}
                  updateGeometry={updateGeometry}
                />
              </Box>
            )}
            {!mapView && locationFormat !== null && (
              <Skeleton variant="rectangular" animation="wave" height="100%" />
            )}
            <Box id="mapView" height="100%"></Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { sm: 'row', xs: 'column' },
            justifyContent: 'end',
            gap: 1,
            mt: 3,
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
            variant="contained"
            startIcon={<ArrowForwardIos />}
            disabled={locationFormat === null}
            onClick={handleNextPage}
          >
            Next
          </PillButton>
        </Box>
      </Card>
    </>
  );
}
