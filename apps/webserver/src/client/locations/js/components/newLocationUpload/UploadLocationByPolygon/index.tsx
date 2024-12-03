import React, { useEffect, useState } from 'react';
import './index.scss';

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

import { ExternalHelperResource, LocationTypeButton } from '../components';

import { PillButton } from '../../../../../components';
import { coordinateSchema } from '../utils/schema';
import { createGeometryAndGraphic } from '../../adding/PolygonCoordinates/polygonCoordinates.utils';
import { useMap } from '../hooks/useMap';

import LocationMapDrawer from '../../adding/LocationMapDrawer';
import { useUploadLocation } from '../contexts/UploadLocationContext';

const MIN_AMOUNT_OF_COORDINATES = 3;
const MAX_AMOUNT_OF_COORDINATES = 10;

const COORDINATE_ERROR_MESSAGE =
  'Your coordinate value is invalid. Please ensure your data is in decimal degree notation';

enum LocationFormat {
  DrawAShape,
  PolygonCoordinates,
}

const schema = z.record(coordinateSchema);
type FormFields = z.infer<typeof schema>;

export function UploadLocationByPolygon() {
  const theme = useTheme();
  const { clearUploadType } = useUploadLocation();
  const isRegularScreenSize = useMediaQuery(theme.breakpoints.up('sm'));

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormFields>({ resolver: zodResolver(schema) });

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
    reset(); // clean out previous values from form

    coordinates.forEach(({ id, latitude, longitude }) => {
      setValue(`${id}`, { latitude: latitude.toString(), longitude: longitude.toString() });
    });
  }, [coordinates]);

  const handleChangeLocationFormat = (locFormat: LocationFormat) => {
    setLocationFormat(locFormat);
  };

  const onSubmit = (data: FormFields) => {
    const coordinates: z.infer<typeof coordinateSchema>[] = [];

    for (const key in data) {
      const { latitude, longitude } = data[key];

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

  const isLocationFormatInDrawAShape = locationFormat === LocationFormat.DrawAShape;
  const isLocationFormatInPolygonCoordinates = locationFormat === LocationFormat.PolygonCoordinates;

  return (
    <Card sx={{ pt: 1, pb: 2, px: 2 }}>
      <Typography variant="h6">Prepare your location</Typography>
      <Typography variant="body2" sx={{ mt: 0.5, mb: 1 }}>
        GFW Pro allows users to create polygon data for analysis view drawing a boundary on the map
        or defining a polygon via its coordinates vertices.
      </Typography>
      <ExternalHelperResource text="How to format your location data for GFW Pro" url="#" />

      <Typography variant="h6" sx={{ mt: 2 }}>
        Choose your location type
      </Typography>
      <Typography variant="body2">
        Select draw a shape and start drawing or you can enter coordinates.
      </Typography>

      <Box sx={{ display: { sm: 'flex', xs: 'block' }, gap: 3, mt: 1.5, height: { sm: '500px' } }}>
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
            <Draw fontSize="medium" />
            <Typography variant="body2">Draw a shape</Typography>
          </LocationTypeButton>
          {!isLocationFormatInPolygonCoordinates ? (
            <LocationTypeButton
              variant="outlined"
              color="info"
              onClick={() => handleChangeLocationFormat(LocationFormat.PolygonCoordinates)}
            >
              <AddLocationAlt fontSize="medium" />
              <Typography variant="body2">Enter polygon coordinates</Typography>
            </LocationTypeButton>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{
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
                  <AddLocationAlt fontSize="medium" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Enter coordinates
                  </Typography>
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
                            name={`${id}.latitude`}
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
                                error={!!errors[id]?.latitude}
                                helperText={errors[id]?.latitude ? COORDINATE_ERROR_MESSAGE : ''}
                              />
                            )}
                          />
                          <Controller
                            name={`${id}.longitude`}
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
                                error={!!errors[id]?.longitude}
                                helperText={errors[id]?.longitude ? COORDINATE_ERROR_MESSAGE : ''}
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
            </form>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            position: 'relative',
            height: { xs: '500px' },
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
        >
          Next
        </PillButton>
      </Box>
    </Card>
  );
}
