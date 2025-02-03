import React, { useState } from 'react';
import { Box, Card, Link, Typography } from '@mui/material';
import { ArrowBackIos, Close, EditNote, Publish } from '@mui/icons-material';

import { useHistory } from '../hooks';
import { LoadingModal, PillButton } from '../../../../../components';
import { useUploadLocation } from '../contexts';
import { NavBar } from '../components';
import { analysisTypesOptionsNewNames } from '../../../../../../config/env/analysisTypes.constants';
import { commodities } from '../utils/constants';
import { uploadFileToS3 } from '../utils/upload';
import { uploadProcessByPrevUploadedFile } from '../../landing/uploadProcess';
import { UploadType } from '../types';

export function SummaryAndSubmit() {
  const history = useHistory();
  const { clearUploadType, uploadLocationState, updateSaveMode } = useUploadLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isAddingToNewList = !!uploadLocationState.newListName;
  const commodity = commodities[uploadLocationState.commodity as keyof typeof commodities];

  const createGeoJSONFile = async (): Promise<File | null> => {
    const { uploadType, coordinates, area, commodity, locationName } = uploadLocationState;

    if (!coordinates || !coordinates.length) {
      return null;
    }

    const geometry =
      uploadType === UploadType.ByPoint
        ? { type: 'Point', coordinates: [coordinates[0].longitude, coordinates[0].latitude] }
        : {
            type: 'Polygon',
            coordinates: [[coordinates.map(({ longitude, latitude }) => [longitude, latitude])]],
          };

    const properties = {
      Commodity: commodity,
      'Location Name': locationName,
      [area.measurementUnit === 'hectares' ? 'Analysis Area' : 'Analysis Radius']: area.size,
    };

    const geojson = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties, geometry }],
    };

    return new File([JSON.stringify(geojson, null, 2)], 'data.geojson', {
      type: 'application/geo+json',
    });
  };

  const uploadList = async ({ isDraft }: { isDraft: boolean }) => {
    if (uploadLocationState.uploadType === null) {
      return;
    }

    if (uploadLocationState.typeOfAnalysis.AFI) {
      gtag('event', 'User saved a list with Deforestation Reporting KPIs analysis selected', {
        event_category: 'Deforestation Reporting KPIs',
      });
    }

    let uploadedFile = uploadLocationState.uploadedFile;

    if ([UploadType.ByPoint, UploadType.ByPolygon].includes(uploadLocationState.uploadType)) {
      const geojsonFile = await createGeoJSONFile();
      if (!geojsonFile) {
        return;
      }

      uploadedFile = await uploadFileToS3(geojsonFile);
    }

    if (!uploadedFile) {
      return; // Handle missing file scenario
    }

    try {
      setIsLoading(true);
      const listName = uploadLocationState.newListName || uploadLocationState.existingList?.name;
      const analysisIds = Object.keys(uploadLocationState.typeOfAnalysis).filter(
        (key) =>
          uploadLocationState.typeOfAnalysis[key as keyof typeof uploadLocationState.typeOfAnalysis]
      );

      await uploadProcessByPrevUploadedFile({
        listName,
        analysisIds,
        fileS3Route: uploadedFile.fileS3Route,
        keyFile: uploadedFile.keyFile,
        list_id: uploadLocationState.existingList?.id,
        saveAsDraft: isDraft,
      });
      updateSaveMode(isDraft);
      history.push('SUBMISSION_SUCCESS');
    } catch (err) {
      console.error('Upload process failed:', err);
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <Card sx={{ height: '634px', display: 'flex', flexDirection: 'column', pt: 1, px: 2, pb: 2 }}>
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
                <b>{uploadLocationState.existingList?.name}</b>.
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
          <PillButton
            type="submit"
            color="secondary"
            variant="contained"
            startIcon={<EditNote />}
            onClick={() => uploadList({ isDraft: true })}
          >
            Save as draft
          </PillButton>
          <PillButton
            type="submit"
            variant="contained"
            startIcon={<Publish />}
            onClick={() => uploadList({ isDraft: false })}
          >
            Submit for analysis
          </PillButton>
        </Box>
      </Card>
      <LoadingModal isLoading={isLoading} />
    </>
  );
}
