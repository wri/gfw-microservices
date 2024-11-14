import React, { useRef, useState } from 'react';
import './index.scss';

import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Card, TextField, Typography, useTheme } from '@mui/material';
import { AddLocationAlt, Close, ArrowForwardIos, Draw, Add, Check } from '@mui/icons-material';

import { HowToFormatLocationLink, LocationTypeButton } from '../components';

import { PillButton } from '../../../../../components';
import { ChangePageType } from '../types';
import { coordinateSchema } from '../utils/schema';
import { createGeometryAndGraphic } from '../../adding/PolygonCoordinates/polygonCoordinates.utils';
import { useMap } from '../hooks/useMap';

import LocationMapDrawer from '../../adding/LocationMapDrawer';

const MAX_AMOUNT_OF_COORDINATES = 10;
const COORDINATE_ERROR_MESSAGE =
  'Your coordinate value is invalid. Please ensure your data is in decimal degree notation';

enum LocationFormat {
  DrawAShape,
  PolygonCoordinates,
}

const schema = z.record(coordinateSchema);
type FormFields = z.infer<typeof schema>;

export function UploadLocationByPolygon({ setUploadType }: ChangePageType) {
  const theme = useTheme();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormFields>({ resolver: zodResolver(schema) });

  const {
    mapView,
    sketchViewModel,
    setSketchViewModel,
    updateGeometry,
    coordinates,
    setCoordinates,
    addGraphicToMap,
    generateEmptyCoordinate,
  } = useMap(false);

  const [locationFormat, setLocationFormat] = useState<LocationFormat>(LocationFormat.DrawAShape);
  const okButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleAddCoordinateField = () => {
    setCoordinates((prev) => [...prev, generateEmptyCoordinate()]);
    okButtonRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  return (
    <Card sx={{ padding: '10px 16px 15px' }}>
      <Typography variant="h6">Prepare your location</Typography>
      <Typography variant="body2">
        GFW Pro allows users to create polygon data for analysis view drawing a boundary on the map
        or defining a polygon via its coordinates vertices.
      </Typography>
      <HowToFormatLocationLink text="How to format your location data for GFW Pro" url="#" />

      <Typography variant="h6" sx={{ marginTop: '1rem' }}>
        Choose your location type
      </Typography>
      <Typography variant="body2">
        Select draw a shape and start drawing or you can enter coordinates.
      </Typography>

      <Box sx={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
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
            color={locationFormat === LocationFormat.DrawAShape ? 'primary' : 'info'}
            onClick={() => handleChangeLocationFormat(LocationFormat.DrawAShape)}
            sx={{ maxWidth: '274px' }}
          >
            <Draw fontSize="medium" />
            <Typography variant="body2">Draw a shape</Typography>
          </LocationTypeButton>
          {isLocationFormatInDrawAShape ? (
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
                width: '440px',
                maxHeight: '430px',
                overflow: 'auto',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AddLocationAlt fontSize="medium" />
                <Typography variant="body2">Enter coordinates</Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '10px 1fr 1fr',
                  rowGap: '1.5rem',
                  columnGap: '0.75rem',
                  marginTop: '1rem',
                }}
              >
                {coordinates.map(({ id, latitude, longitude }, index) => {
                  return (
                    <React.Fragment key={id}>
                      <Typography sx={{ marginTop: '9px' }}>{index + 1}</Typography>
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
                            defaultValue={latitude}
                            error={!!errors[id]?.latitude}
                            helperText={errors[id]?.latitude ? COORDINATE_ERROR_MESSAGE : ''}
                            {...field}
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
                            defaultValue={longitude}
                            error={!!errors[id]?.longitude}
                            helperText={errors[id]?.longitude ? COORDINATE_ERROR_MESSAGE : ''}
                            {...field}
                          />
                        )}
                      />
                    </React.Fragment>
                  );
                })}
              </Box>
              <PillButton
                sx={{ margin: '1rem 0 2rem', alignSelf: 'center' }}
                startIcon={<Add style={{ color: theme.palette.primary.main }} />}
                disabled={coordinates.length === MAX_AMOUNT_OF_COORDINATES}
                onClick={handleAddCoordinateField}
              >
                Add Coordinate
              </PillButton>
              <PillButton
                type="submit"
                ref={okButtonRef}
                variant="contained"
                sx={{ alignSelf: 'end' }}
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
            height: '490px',
            position: 'relative',
          }}
        >
          {mapView && (
            <Box
              sx={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
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
          <Box sx={{ height: '100%', width: '100%' }} id="mapView"></Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'end',
          gap: '0.5rem',
          marginTop:
            coordinates.length > 3 && locationFormat === LocationFormat.PolygonCoordinates
              ? '0'
              : '2rem',
        }}
      >
        <PillButton
          variant="contained"
          color="info"
          startIcon={<Close />}
          onClick={() => setUploadType(null)}
        >
          Cancel
        </PillButton>
        <PillButton variant="contained" startIcon={<ArrowForwardIos />}>
          Next
        </PillButton>
      </Box>
    </Card>
  );
}
