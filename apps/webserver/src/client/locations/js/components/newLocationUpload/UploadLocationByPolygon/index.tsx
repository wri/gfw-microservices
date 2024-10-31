import React, { useState } from 'react';

import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';
import { areasAndLengths } from '@arcgis/core/rest/geometryService';
import AreasAndLengthsParameters from '@arcgis/core/rest/support/AreasAndLengthsParameters';
import Point from '@arcgis/core/geometry/Point';

import { Box, Card, TextField, Typography, useTheme } from '@mui/material';
import { AddLocationAlt, Close, ArrowForwardIos, Draw, Add, Check } from '@mui/icons-material';

import { HowToFormatLocationLink, LocationTypeButton, NavBarWithProgress } from '../components';
import AddLocationMap from '../../adding/AddLocationMap';
import { PillButton } from '../../../../../components';
import { MeasurementUnit } from '../types';

const ARCGIS_GEOMETRY_SERVER_URL =
  'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer';

const MAX_AMOUNT_OF_COORDINATES = 10;

enum LocationFormat {
  DrawAShape,
  PolygonCoordinates,
}

type UploadLocationByPointProps = {
  clearUploadType: () => void;
};

type MapData = {
  geometry?: Point;
  measurementUnit: MeasurementUnit;
  areaAround: string;
  calculatedArea: number;
};

export function UploadLocationByPolygon({ clearUploadType }: UploadLocationByPointProps) {
  const theme = useTheme();

  const steps = ['Location', 'Configure List', 'Submit'];
  const [activeStep] = React.useState(0);

  const [locationFormat, setLocationFormat] = useState<LocationFormat>(LocationFormat.DrawAShape);

  const [mapData, setMapData] = useState<MapData>({
    measurementUnit: 'hectares',
    areaAround: '',
    calculatedArea: 0,
  });

  const [listOfCoordinates, setListOfCoordinates] = useState([
    { id: 1, latitude: null, longitude: null },
    { id: 2, latitude: null, longitude: null },
    { id: 3, latitude: null, longitude: null },
  ]);

  const handleAddCoordinateField = () =>
    setListOfCoordinates((prev) => [
      ...prev,
      { id: prev.length + 1, latitude: null, longitude: null },
    ]);

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

  const isLocationFormatInPolygon = locationFormat === LocationFormat.PolygonCoordinates;

  return (
    <Box>
      <NavBarWithProgress clearUploadType={clearUploadType} steps={steps} activeStep={activeStep} />

      <Card sx={{ padding: '10px 16px 15px' }}>
        <Typography variant="h6">Prepare your location</Typography>
        <Typography variant="body2">
          GFW Pro allows users to create polygon data for analysis view drawing a boundary on the
          map or defining a polygon via its coordinates vertices.
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
              onClick={() => setLocationFormat(LocationFormat.DrawAShape)}
              sx={{ maxWidth: '274px' }}
            >
              <Draw fontSize="medium" />
              <Typography variant="body2">Draw a shape</Typography>
            </LocationTypeButton>
            <LocationTypeButton
              variant="outlined"
              color={isLocationFormatInPolygon ? 'primary' : 'info'}
              onClick={() => setLocationFormat(LocationFormat.PolygonCoordinates)}
              sx={{
                flexDirection: isLocationFormatInPolygon ? 'column' : 'row',
                alignItems: isLocationFormatInPolygon ? 'start' : 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AddLocationAlt fontSize="medium" />
                <Typography variant="body2">
                  {isLocationFormatInPolygon ? 'Enter  coordinates' : 'Enter polygon coordinates'}
                </Typography>
              </Box>

              {isLocationFormatInPolygon && (
                <>
                  <Box
                    sx={{
                      display: 'grid',
                      gap: '1rem',
                      marginTop: '1rem',
                      maxHeight: '250px',
                      overflow: 'auto',
                    }}
                  >
                    {listOfCoordinates.map((coordinate) => (
                      <Box
                        key={coordinate.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          paddingTop: '5px',
                        }}
                      >
                        {coordinate.id}
                        <TextField label="Latitude" variant="outlined" type="number" size="small" />
                        <TextField label="Latitude" variant="outlined" type="number" size="small" />
                      </Box>
                    ))}
                  </Box>
                  <PillButton
                    sx={{ margin: '1rem 0 2rem', alignSelf: 'center' }}
                    startIcon={<Add style={{ color: theme.palette.primary.main }} />}
                    disabled={listOfCoordinates.length === MAX_AMOUNT_OF_COORDINATES}
                    onClick={handleAddCoordinateField}
                  >
                    Add Coordinate
                  </PillButton>
                  <PillButton
                    variant="contained"
                    sx={{ alignSelf: 'end' }}
                    startIcon={<Check style={{ color: 'white' }} />}
                  >
                    Ok
                  </PillButton>
                </>
              )}
            </LocationTypeButton>
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
            marginTop: listOfCoordinates.length > 3 ? '0' : '2rem',
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
          <PillButton variant="contained" startIcon={<ArrowForwardIos />}>
            Next
          </PillButton>
        </Box>
      </Card>
    </Box>
  );
}
