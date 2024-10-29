import React, { useState } from 'react';

import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';
import { areasAndLengths } from '@arcgis/core/rest/geometryService';
import AreasAndLengthsParameters from '@arcgis/core/rest/support/AreasAndLengthsParameters';

import { HowToFormatLocationLink, LocationTypeButton, NavBarWithProgress } from '../components';
import { Box, Card, Typography } from '@mui/material';
import { AddLocationAlt, Close, ArrowForwardIos, Draw } from '@mui/icons-material';
import AddLocationMap from '../../adding/AddLocationMap';
import { PillButton } from '../../../../../components';

enum LocationFormat {
  DrawAShape,
  PolygonCoordinates,
}

type UploadLocationByPointProps = {
  clearUploadType: () => void;
};

type MapData = {
  geometry: any;
  measurementUnit: 'hectares' | 'kilometers';
  areaAround: string;
  calculatedArea: number;
};

export function UploadLocationByPolygon({ clearUploadType }: UploadLocationByPointProps) {
  const steps = ['Location', 'Configure List', 'Submit'];
  const [activeStep] = React.useState(0);

  const [locationFormat, setLocationFormat] = useState<LocationFormat>(LocationFormat.DrawAShape);

  const [mapData, setMapData] = useState<MapData>({
    geometry: {},
    measurementUnit: 'hectares',
    areaAround: '',
    calculatedArea: 0,
  });

  const setMeasurementUnit = (unit: 'hectares' | 'kilometers') => {
    setMapData({
      ...mapData,
      measurementUnit: unit,
    });
  };

  const setGeometry = (geometry: any) => {
    let wgsGeometry = {};

    if (geometry?.spatialReference?.wkid === 102100) {
      wgsGeometry = webMercatorToGeographic(geometry);
    } else {
      wgsGeometry = geometry;
    }

    if (geometry?.latitude) {
      setMapData({
        ...mapData,
        geometry: wgsGeometry,
      });
    } else {
      const url =
        'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer';
      const params = new AreasAndLengthsParameters({
        areaUnit: 'hectares',
        polygons: [wgsGeometry],
      });
      areasAndLengths(url, params).then((res) => {
        const area = res.areas && res.areas.length > 0 ? res.areas[0] : 0;

        setMapData({
          ...mapData,
          geometry: wgsGeometry,
          calculatedArea: Math.abs(area.toFixed ? area.toFixed(2) : 0),
        });
      });
    }
  };

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
            >
              <Draw fontSize="medium" />
              <Typography variant="body2">Draw a shape</Typography>
            </LocationTypeButton>
            <LocationTypeButton
              variant="outlined"
              color={locationFormat === LocationFormat.PolygonCoordinates ? 'primary' : 'info'}
              onClick={() => setLocationFormat(LocationFormat.PolygonCoordinates)}
            >
              <AddLocationAlt fontSize="medium" />
              <Typography variant="body2">Enter polygon coordinates</Typography>
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

        <Box sx={{ display: 'flex', justifyContent: 'end', gap: '0.5rem', marginTop: '2rem' }}>
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
