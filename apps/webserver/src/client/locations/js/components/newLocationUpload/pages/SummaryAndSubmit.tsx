import React, { useState, FormEvent } from 'react';
import { Box, Card, Link, Typography } from '@mui/material';
import { ArrowBackIos, Close, EditNote, Publish } from '@mui/icons-material';

import { useHistory } from '../hooks';
import { LoadingModal, PillButton } from '../../../../../components';
import { useUploadLocation } from '../contexts';
import { NavBar } from '../components';
import { analysisTypesOptionsNewNames } from '../../../../../../config/env/analysisTypes.constants';
import { commodities } from '../utils/constants';
import Point from '@arcgis/core/geometry/Point';
import geojsonUtil from '../../../../../common/js/utils/arcgis-to-geojson';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';

import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import { Area, Coordinate, UploadType } from '../types';
import { uploadFileToS3 } from '../utils/upload';
import { uploadProcessByPrevUploadedFile } from '../../landing/uploadProcess';

export function SummaryAndSubmit() {
  const history = useHistory();
  const { clearUploadType, uploadLocationState } = useUploadLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = (e: FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsLoading(true);
  };

  const isAddingToNewList = !!uploadLocationState.newListName;
  const commodity = commodities[uploadLocationState.commodity as keyof typeof commodities];

  const uploadList = async () => {
    if (uploadLocationState.typeOfAnalysis.AFI) {
      gtag('event', 'User saved a list with Deforestation Reporting KPIs analysis selected', {
        event_category: 'Deforestation Reporting KPIs',
      });
    }

    let uploadedFile = uploadLocationState.uploadedFile;
    if (
      uploadLocationState.uploadType === UploadType.ByPoint ||
      uploadLocationState.uploadType === UploadType.ByPolygon
    ) {
      const geometry = createPointGeometry({
        area: uploadLocationState.area,
        coordinate: uploadLocationState.coordinates[0],
      });
      const { coordinates, area, commodity, locationName } = uploadLocationState;

      const properties = {
        Latitude: coordinates[0].latitude,
        Longitude: coordinates[0].longitude,
        'Analysis Radius': area.size,
        Commodity: commodity,
        'Location Name': locationName,
        'Accuracy Rating of Location Entered': 3, // check if this can be removed
      };
      const geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties,
            geometry: geojsonUtil.arcgisToGeoJSON(geometry),
          },
        ],
      };

      const file = new File([JSON.stringify(geojson, null, 2)], 'data.json', {
        type: 'application/json',
      });

      uploadedFile = await uploadFileToS3(file);
    }

    if (!uploadedFile) {
      return;
    }

    try {
      const listName = uploadLocationState.newListName || uploadLocationState.existingListName;

      const analysisIds = Object.keys(uploadLocationState.typeOfAnalysis).filter(
        (key) =>
          uploadLocationState.typeOfAnalysis[key as keyof typeof uploadLocationState.typeOfAnalysis]
      );

      await uploadProcessByPrevUploadedFile({
        listName,
        analysisIds,
        fileS3Route: uploadedFile.fileS3Route,
        keyFile: uploadedFile.keyFile,
        list_id: 0,
      });
    } catch (err) {
      console.log('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <Card
        component="form"
        onSubmit={onSubmit}
        sx={{ height: '634px', display: 'flex', flexDirection: 'column', pt: 1, px: 2, pb: 2 }}
      >
        <Typography variant="h6">Summary & Submit</Typography>

        <Box
          sx={{
            padding: 1.25,
            borderRadius: 1,
            width: '500px',
            mt: 3,
            mx: 'auto',
            backgroundColor: 'background.default',
          }}
        >
          <Typography variant="body2">
            You are{' '}
            {isAddingToNewList ? (
              <>
                creating a new <b>{commodity}</b> list named{' '}
                <b>{uploadLocationState.newListName}</b>.
              </>
            ) : (
              <>
                adding <b>{commodity}</b> location(s) to the list named{' '}
                <b>{uploadLocationState.existingListName}</b>.
              </>
            )}
          </Typography>
          <Typography variant="body2">
            {isAddingToNewList ? 'Your ' : 'The resulting '}list will be submitted for the following
            analysis:
          </Typography>
          <Box component="ul" sx={{ color: 'text.secondary' }}>
            {Object.entries(uploadLocationState.typeOfAnalysis)
              .filter(([key, isChecked]) => isChecked && key !== 'palmRiskAssessment')
              .map(([key]) => {
                const analysis = analysisTypesOptionsNewNames.find((x) => x.id === key);

                const isPalmRiskAssessmentIncluded =
                  analysis?.id === 'FCD' && uploadLocationState.typeOfAnalysis.palmRiskAssessment;

                return (
                  <li key={key}>
                    <Typography variant="caption">{analysis?.label}</Typography>
                    {isPalmRiskAssessmentIncluded && (
                      <Typography variant="caption"> (Includes Palm Risk Assessment)</Typography>
                    )}
                  </li>
                );
              })}
          </Box>

          <Typography variant="body2">
            Please note that all analysis submission count towards your usage limits. See more
            information{' '}
            <Link href="#" sx={{ textDecoration: 'none', color: 'primary.main' }}>
              here
            </Link>
            .
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { sm: 'row', xs: 'column' },
            justifyContent: 'end',
            gap: 1,
            mt: 'auto',
            width: '100%',
          }}
        >
          <PillButton
            variant="contained"
            color="info"
            startIcon={<ArrowBackIos />}
            onClick={() => history.goBack()}
            sx={{ mr: 'auto' }}
          >
            Back
          </PillButton>

          <PillButton
            variant="contained"
            color="info"
            startIcon={<Close />}
            onClick={clearUploadType}
          >
            Cancel
          </PillButton>
          <PillButton type="submit" color="secondary" variant="contained" startIcon={<EditNote />}>
            Save as draft
          </PillButton>
          <PillButton
            type="submit"
            variant="contained"
            startIcon={<Publish />}
            onClick={uploadList}
          >
            Submit for analysis
          </PillButton>
        </Box>
      </Card>
      <LoadingModal isLoading={isLoading} />
    </>
  );
}

const createPointGeometry = ({
  coordinate: { latitude, longitude },
  area: { measurementUnit, size },
}: {
  coordinate: Coordinate;
  area: Area;
}) => {
  const centerPoint = new Point({
    latitude: Number(latitude),
    longitude: Number(longitude),
    spatialReference: SpatialReference.WGS84,
  });

  let radius = size;

  if (measurementUnit === 'hectares') {
    radius = Math.sqrt((size * 10000) / Math.PI) / 1000;
  }

  return geometryEngine.geodesicBuffer(centerPoint, radius, 'kilometers');
};
