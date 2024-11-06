import React, { useState } from 'react';

import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';
import { areasAndLengths } from '@arcgis/core/rest/geometryService';
import AreasAndLengthsParameters from '@arcgis/core/rest/support/AreasAndLengthsParameters';
import Point from '@arcgis/core/geometry/Point';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Card, TextField, Typography, useTheme } from '@mui/material';
import { AddLocationAlt, Close, ArrowForwardIos, Draw, Add, Check } from '@mui/icons-material';

import { HowToFormatLocationLink, LocationTypeButton } from '../components';
import AddLocationMap from '../../adding/AddLocationMap';
import { PillButton } from '../../../../../components';
import { ChangePageType, MeasurementUnit } from '../types';
import { coordinateSchema } from '../utils/schema';

const ARCGIS_GEOMETRY_SERVER_URL =
  'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer';

const INITIAL_AMOUNT_OF_COORDINATES = 3;
const MAX_AMOUNT_OF_COORDINATES = 10;
const COORDINATE_ERROR_MESSAGE =
  'Your coordinate value is invalid. Please ensure your data is in decimal degree notation';

enum LocationFormat {
  DrawAShape,
  PolygonCoordinates,
}

type MapData = {
  geometry?: Point;
  measurementUnit: MeasurementUnit;
  areaAround: string;
  calculatedArea: number;
};

const schema = z.record(coordinateSchema);
type FormFields = z.infer<typeof schema>;

export function UploadLocationByPolygon({ setUploadType }: ChangePageType) {
  const theme = useTheme();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormFields>({ resolver: zodResolver(schema) });

  const [locationFormat, setLocationFormat] = useState<LocationFormat>(LocationFormat.DrawAShape);

  const [mapData, setMapData] = useState<MapData>({
    measurementUnit: 'hectares',
    areaAround: '',
    calculatedArea: 0,
  });

  const [amountOfCoordinates, setAmountOfCoordinates] = useState(INITIAL_AMOUNT_OF_COORDINATES);

  const handleAddCoordinateField = () => setAmountOfCoordinates((prev) => prev + 1);

  const setMeasurementUnit = (unit: MeasurementUnit) => {
    setMapData({
      ...mapData,
      measurementUnit: unit,
    });
  };

  const setGeometry = (geometry: Point) => {
    let wgsGeometry: Point;

    if (geometry?.spatialReference?.wkid === 102100) {
      wgsGeometry = webMercatorToGeographic(geometry) as Point;
    } else {
      wgsGeometry = geometry;
    }

    if (geometry?.latitude) {
      setMapData({
        ...mapData,
        geometry: wgsGeometry,
      });
    } else {
      const params = new AreasAndLengthsParameters({
        areaUnit: 'hectares',
        polygons: [wgsGeometry],
      });
      areasAndLengths(ARCGIS_GEOMETRY_SERVER_URL, params).then((res) => {
        const area = res.areas && res.areas.length > 0 ? res.areas[0] : 0;

        setMapData({
          ...mapData,
          geometry: wgsGeometry,
          calculatedArea: Math.abs(area.toFixed ? area.toFixed(2) : 0),
        });
      });
    }
  };

  const handleChangeLocationFormat = (locFormat: LocationFormat) => {
    setLocationFormat(locFormat);
    setAmountOfCoordinates(INITIAL_AMOUNT_OF_COORDINATES);
    reset();
  };

  const onSubmit = (data: unknown) => {
    console.log({ data });
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
                {Array.from({ length: amountOfCoordinates }).map((_, i) => {
                  const count = i + 1;

                  return (
                    <React.Fragment key={count}>
                      <Typography sx={{ marginTop: '9px' }}>{count}</Typography>
                      <Controller
                        name={`${count}.latitude`}
                        control={control}
                        rules={{ required: true }}
                        defaultValue=""
                        render={({ field }) => (
                          <TextField
                            label="Latitude"
                            variant="outlined"
                            type="number"
                            size="small"
                            error={!!errors[count]?.latitude}
                            helperText={errors[count]?.latitude ? COORDINATE_ERROR_MESSAGE : ''}
                            {...field}
                          />
                        )}
                      />
                      <Controller
                        name={`${count}.longitude`}
                        control={control}
                        rules={{ required: true }}
                        defaultValue=""
                        render={({ field }) => (
                          <TextField
                            label="Longitude"
                            variant="outlined"
                            type="number"
                            size="small"
                            error={!!errors[count]?.longitude}
                            helperText={errors[count]?.longitude ? COORDINATE_ERROR_MESSAGE : ''}
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
                disabled={amountOfCoordinates === MAX_AMOUNT_OF_COORDINATES}
                onClick={handleAddCoordinateField}
              >
                Add Coordinate
              </PillButton>
              <PillButton
                type="submit"
                variant="contained"
                sx={{ alignSelf: 'end' }}
                startIcon={<Check style={{ color: 'white' }} />}
              >
                Ok
              </PillButton>
            </form>
          )}
        </Box>
        <Box sx={{ flex: 1, borderRadius: 5 }}>
          <AddLocationMap
            geomFromMap={false}
            setGeometry={setGeometry}
            measurementUnit={mapData.measurementUnit}
            setMeasurementUnit={setMeasurementUnit}
            isNewLocationUpload
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'end',
          gap: '0.5rem',
          marginTop: amountOfCoordinates > 3 ? '0' : '2rem',
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
