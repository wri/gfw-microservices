import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  Collapse,
  Dialog,
  DialogActions,
  DialogTitle,
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

import { LocationMapDrawer, LocationTypeButton, NavBar } from '../components';
import { ExternalHelperResource, PillButton } from '../../../../../components';
import { coordinateSchema, locationNameSchema } from '../utils/schema';
import { createGeometryAndGraphic } from '../../../utils/polygonCoordinatesUtils';
import { useMap } from '../hooks';
import { useUploadLocation } from '../contexts';
import { useHistory } from '../hooks';
import { PolygonFromMapPage, UploadType } from '../types';
import { DATA_CY, ExternalLinks } from '../../../../../utils/constants';

const MIN_AMOUNT_OF_COORDINATES = 3;
const MAX_AMOUNT_OF_COORDINATES = 12;

enum LocationFormat {
  DrawAShape,
  PolygonCoordinates,
}

const uploadByPolygonSchema = z.object({
  coordinates: z.record(coordinateSchema),
});
type FormFieldsCoordinates = z.infer<typeof uploadByPolygonSchema>;

const locationSchema = z.object({ locationName: locationNameSchema });
type FormFieldsLocationName = z.infer<typeof locationSchema>;

export function UploadLocationByPolygon({
  polygonFromMapPage,
}: {
  polygonFromMapPage?: PolygonFromMapPage;
}) {
  const theme = useTheme();
  const history = useHistory();

  const { clearUploadType, setUploadLocationByPolygon, selectUploadType } = useUploadLocation();
  const isRegularScreenSize = useMediaQuery(theme.breakpoints.up('sm'));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const locationNameRef = useRef<HTMLInputElement | null>(null);

  const {
    handleSubmit: handleSubmitLocationName,
    formState: { errors: errorsLocationName },
    register: registerLocationName,
  } = useForm<FormFieldsLocationName>({ resolver: zodResolver(locationSchema) });

  const {
    handleSubmit: handleSubmitCoordinates,
    register: registerCoordinates,
    formState: { errors: errorsCoordinates },
    setValue: setValueCoordinates,
    reset: resetCoordinates,
  } = useForm<FormFieldsCoordinates>({ resolver: zodResolver(uploadByPolygonSchema) });

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
    if (polygonFromMapPage?.geometry) {
      setLocationFormat(LocationFormat.DrawAShape);
    }
  }, []);

  const hasAppliedPolygon = useRef(false);

  useEffect(() => {
    if (hasAppliedPolygon.current) {
      return;
    }

    // draw the map one time when it's redirected from the map page
    const geometryRings = polygonFromMapPage?.geometry?.rings?.[0];
    if (mapView && geometryRings) {
      const coordinates = geometryRings?.map((coord) => ({
        longitude: coord[0].toString(),
        latitude: coord[1].toString(),
      }));

      const formattedCoordinates = coordinates.reduce((acc, coord, index) => {
        acc[index.toString()] = {
          latitude: coord.latitude,
          longitude: coord.longitude,
        };
        return acc;
      }, {} as Record<string, { latitude: string; longitude: string }>);

      setCoordinates(
        coordinates.map((coordinate) => ({
          id: crypto.randomUUID(),
          ...coordinate,
        }))
      );

      onSubmitCoordinates({ coordinates: formattedCoordinates });
      locationNameRef?.current?.focus();
      hasAppliedPolygon.current = true;
    }
  }, [mapView, polygonFromMapPage]);

  useEffect(() => {
    resetCoordinates();

    coordinates.forEach(({ id, latitude, longitude }) => {
      setValueCoordinates(`coordinates.${id}`, {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });
    });
  }, [coordinates]);

  const handleChangeLocationFormat = (locFormat: LocationFormat) => {
    setLocationFormat(locFormat);
  };

  const onSubmitCoordinates = (data: FormFieldsCoordinates) => {
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

  const onSubmitFullForm = ({ locationName }: FormFieldsLocationName) => {
    selectUploadType(UploadType.ByPolygon);
    try {
      const coordinatesString = coordinates.map(({ latitude, longitude }) => ({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      }));
      z.array(coordinateSchema).parse(coordinatesString);
    } catch (err) {
      if (locationFormat === LocationFormat.DrawAShape) {
        setIsDialogOpen(true);
      } else {
        handleSubmitCoordinates(onSubmitCoordinates)();
      }
      return;
    }

    setUploadLocationByPolygon({
      coordinates: coordinates.map(({ latitude, longitude }) => ({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      })),
      locationName,
    });
    history.push('CONFIGURE_LIST');
  };

  const isLocationFormatInDrawAShape = locationFormat === LocationFormat.DrawAShape;
  const isLocationFormatInPolygonCoordinates = locationFormat === LocationFormat.PolygonCoordinates;

  const areLocationTypesEnabled =
    !polygonFromMapPage || coordinates.length <= MAX_AMOUNT_OF_COORDINATES;

  const isDrawButtonVisible = mapView && isLocationFormatInDrawAShape && areLocationTypesEnabled;

  return (
    <>
      <NavBar isComingFromMap={!!polygonFromMapPage} />
      <Card
        component="form"
        onSubmit={handleSubmitLocationName(onSubmitFullForm)}
        sx={{ pt: 1, pb: 2, px: 2 }}
      >
        <Typography variant="h6">Prepare your location</Typography>
        <Typography
          variant="caption"
          sx={{ display: 'inline-block', mt: 0.5, mb: 1, color: 'text.secondary' }}
        >
          GFW Pro allows users to create polygon data for analysis view drawing a boundary on the
          map or defining a polygon via its coordinates vertices.
        </Typography>
        <ExternalHelperResource
          text="How to define polygon data on GFW Pro"
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
          placeholder="Location name"
          fullWidth
          error={!!errorsLocationName.locationName}
          helperText={errorsLocationName.locationName?.message}
          inputRef={locationNameRef}
          {...registerLocationName('locationName')}
        />

        {areLocationTypesEnabled && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: '500' }}>
              Choose your location type
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Select draw a shape and start drawing or you can enter coordinates.
            </Typography>
          </>
        )}

        <Box
          sx={{ display: { sm: 'flex', xs: 'block' }, gap: 3, mt: 1.5, height: { sm: '470px' } }}
        >
          {areLocationTypesEnabled && (
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
                  data-testid="enter-polygon-coords-btn"
                >
                  <AddLocationAlt sx={{ fontSize: (theme) => theme.typography.h4 }} />
                  <Typography variant="body2">Enter polygon coordinates</Typography>
                </LocationTypeButton>
              ) : (
                <Box
                  component="form"
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
                      {coordinates.map(({ id }, index) => {
                        return (
                          <Collapse key={id}>
                            <ListItem
                              sx={{ display: 'flex', alignItems: 'start', gap: 1 }}
                              disableGutters
                            >
                              <Typography sx={{ minWidth: '1rem', marginTop: 1 }}>
                                {index + 1}
                              </Typography>
                              <TextField
                                label="Latitude"
                                variant="outlined"
                                type="number"
                                size="small"
                                data-testid="latitude-input"
                                error={!!errorsCoordinates.coordinates?.[id]?.latitude}
                                helperText={
                                  errorsCoordinates.coordinates?.[id]?.latitude
                                    ? 'This latitude value is invalid'
                                    : ''
                                }
                                {...registerCoordinates(`coordinates.${id}.latitude`, {
                                  required: true,
                                  onChange: (e) =>
                                    handleUpdateCoordinate(id, 'latitude', e.target.value),
                                })}
                              />
                              <TextField
                                label="Longitude"
                                variant="outlined"
                                type="number"
                                size="small"
                                data-testid="longitude-input"
                                error={!!errorsCoordinates.coordinates?.[id]?.longitude}
                                helperText={
                                  errorsCoordinates.coordinates?.[id]?.longitude
                                    ? 'This longitude value is invalid'
                                    : ''
                                }
                                {...registerCoordinates(`coordinates.${id}.longitude`, {
                                  required: true,
                                  onChange: (e) =>
                                    handleUpdateCoordinate(id, 'longitude', e.target.value),
                                })}
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
                    type="button"
                    variant="contained"
                    sx={{ alignSelf: 'end', width: { sm: 'fit-content', xs: '100%' } }}
                    startIcon={<Check />}
                    onClick={handleSubmitCoordinates(onSubmitCoordinates)}
                  >
                    Ok
                  </PillButton>
                </Box>
              )}
            </Box>
          )}

          <Box
            sx={{
              flex: 1,
              position: 'relative',
              height: { xs: '470px' },
            }}
          >
            {isDrawButtonVisible && (
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
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByPolygon].LOCATION_CANCEL}
            onClick={clearUploadType}
          >
            Cancel
          </PillButton>
          <PillButton
            type="submit"
            variant="contained"
            startIcon={<ArrowForwardIos />}
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByPolygon].LOCATION_NEXT}
            disabled={locationFormat === null}
          >
            Next
          </PillButton>
        </Box>

        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Invalid polygon</DialogTitle>
          <DialogActions>
            <PillButton onClick={() => setIsDialogOpen(false)} autoFocus>
              Ok
            </PillButton>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  );
}
