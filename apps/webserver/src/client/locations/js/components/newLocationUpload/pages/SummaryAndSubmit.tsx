import React, { useState, FormEvent } from 'react';
import { Box, Card, Link, Typography } from '@mui/material';
import { ArrowBackIos, Close, EditNote, Publish } from '@mui/icons-material';

import { useHistory } from '../hooks';
import { LoadingModal, PillButton } from '../../../../../components';
import { useUploadLocation } from '../contexts';
import { NavBar } from '../components';
import { analysisTypesOptionsNewNames } from '../../../../../../config/env/analysisTypes.constants';
import { commodities } from '../utils/constants';
import { deduceActiveId } from '../../../../../common/js/utils/templateUtils';
import { UploadLocationState } from '../contexts/UploadLocationContext';
import Point from '@arcgis/core/geometry/Point';
import { getListStatusId } from '../../../utils/lists.utils';
import { saveAsDraftListConfig } from '../../../../../../config/config/locations.config';
import geojsonUtil from '../../../../../common/js/utils/arcgis-to-geojson';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';

import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import { Area, Coordinate } from '../types';
import { getGadmService } from '../../../../../common/js/utils/getGadmService.utils';
import { esriQuery } from '../../../utils/esriTasks';

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
            onClick={() => uploadList({ isSaveAsDraft: false, uploadLocationState })}
          >
            Submit for analysis
          </PillButton>
        </Box>
      </Card>
      <LoadingModal isLoading={isLoading} />
    </>
  );
}

const uploadList = async ({
  isSaveAsDraft,
  uploadLocationState,
}: {
  isSaveAsDraft: boolean;
  uploadLocationState: UploadLocationState;
}) => {
  if (uploadLocationState.typeOfAnalysis.AFI) {
    gtag('event', 'User saved a list with Deforestation Reporting KPIs analysis selected', {
      event_category: 'Deforestation Reporting KPIs',
    });
  }

  const listName = uploadLocationState.newListName || uploadLocationState.existingListName;

  const templateId = deduceActiveId(uploadLocationState.commodity);

  const geometry = createPointGeometry({
    area: uploadLocationState.area,
    coordinate: uploadLocationState.coordinates[0],
  });

  const adminArea = await deduceAdmin(geometry);

  const properties = {} as any;
  properties.Latitude = uploadLocationState.coordinates[0].latitude;
  properties.Longitude = uploadLocationState.coordinates[0].longitude;
  properties.Commodity = uploadLocationState.commodity;
  properties['List Name'] = listName;
  properties['Location Name'] = uploadLocationState.locationName;
  properties['Analysis Area'] = uploadLocationState.area.size;
  properties['Analysis Radius'] = uploadLocationState.area.size;
  properties.gadmid = adminArea?.gadmid;

  const geojsonGeom = geojsonUtil.arcgisToGeoJSON(geometry);

  // Necessary to please the server's checks (this is no longer a field we use)
  properties['Accuracy Rating of Location Entered'] = 3;

  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties,
        geometry: geojsonGeom,
      },
    ],
  };

  try {
    const response = await fetch('/locations/gadm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ geojson }),
    });

    const jsonResponse = await response.json();
    const updatedGeoJSON = jsonResponse.geojson;

    if (updatedGeoJSON.features.length === 0) {
      // show error to the user
      return;
    }

    let bigObj;
    if (uploadLocationState.newListName) {
      bigObj = {
        list_name: listName,
        template_id: templateId,
        commodity: uploadLocationState.commodity,
        geojson: updatedGeoJSON,
        custom_attributes: [],
        location_classification: '',
        list_status_id: getListStatusId(isSaveAsDraft),
        analysisIds: Object.keys(uploadLocationState.typeOfAnalysis).filter(
          (key) =>
            uploadLocationState.typeOfAnalysis[
              key as keyof typeof uploadLocationState.typeOfAnalysis
            ]
        ),
        attributes: '',
      };

      const route = isSaveAsDraft ? saveAsDraftListConfig.route : '/locations/addToNewList';
      const fetchResponse = await fetch(route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bigObj),
      });

      if (!fetchResponse.ok) {
        throw new Error('Failed to create/update list');
      }

      gtag('event', 'Upload List', {
        event_category: 'Submit',
        event_label: isSaveAsDraft
          ? 'User uploads a list with single location as a draft'
          : 'User uploads a list with single location and submits',
      });
    }

    // display "Locations have been successfully added."
  } catch (err) {
    console.error(err);
    // display "An error occurred while processing your request. Please try again."
  }
};

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

const deduceAdmin = async (deduceAdminGeometry: any) => {
  try {
    const serviceURL = getGadmService();
    const geometry = deduceAdminGeometry.centroid || deduceAdminGeometry;
    const queryProperties = {
      geometry,
      returnGeometry: false,
      outFields: ['name_0', 'name_1', 'name_2', 'gadmid'],
    };

    const response = await esriQuery(serviceURL, queryProperties);
    if (response.features?.length > 0) {
      const { name_0, name_1, name_2, gadmid } = response.features[0].attributes;
      return { substate: name_2, state: name_1, country: name_0, gadmid };
    }
  } catch (err) {
    console.error('Error', err);
  }
};
