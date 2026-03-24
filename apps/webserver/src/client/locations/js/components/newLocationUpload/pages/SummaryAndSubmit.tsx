import { useRef, useState } from 'react';
import axios from 'axios';
import errorLogger from '../../../../../common/js/utils/errorLogger';
import {
  Box,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
} from '@mui/material';
import { ArrowBackIos, Close, EditNote, Publish } from '@mui/icons-material';

import { useHistory } from '../hooks';
import { useTransifexTranslation } from '../../../../../hooks';
import { LoadingModal, PillButton } from '../../../../../components';
import { useUploadLocation } from '../contexts';
import { FileValidationHelper, NavBar } from '../components';
import {
  analysisTypes,
  analysisTypesOptionsNewNames,
  AlertsAnalysisFrequency,
  weeklyAlertsAnalysis,
} from '../../../../../../config/env/analysisTypes.constants';
import { commodities } from '../utils/constants';
import { uploadFileToS3 } from '../utils/upload';
import { uploadProcessByPrevUploadedFile } from '../../landing/uploadProcess';
import { UploadType } from '../types';
import { DATA_CY, ExternalLinks } from '../../../../../utils/constants';
import featureFlags from '../../../../../../utils/general.utils';

export function SummaryAndSubmit() {
  const isWeeklyAlertsAvailable = (featureFlags as any).isWeeklyAlertsAvailable;
  const history = useHistory();
  const { clearUploadType, uploadLocationState, updateSaveMode } = useUploadLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const isDraftUpload = useRef(false);

  const isAddingToNewList = !!uploadLocationState.newListName;
  const listName = uploadLocationState.newListName || uploadLocationState.existingList?.name;
  const commodity = commodities[uploadLocationState.commodity as keyof typeof commodities];

  // Function to convert coordinates to GeoJSON format respecting the right-hand rule
  const mountPolygon = (coordinates) => {
    // Function to calculate the signed area of the polygon
    function signedArea(coords) {
      let area = 0;
      for (let i = 0; i < coords.length; i++) {
        const j = (i + 1) % coords.length;
        area += coords[i][0] * coords[j][1];
        area -= coords[j][0] * coords[i][1];
      }
      return area / 2;
    }

    // Check if the coordinates are in clockwise order
    if (signedArea(coordinates) > 0) {
      // Reverse the coordinates to make them counter-clockwise
      coordinates.reverse();
    }

    // Create GeoJSON object
    return {
      type: 'Polygon',
      coordinates: [coordinates],
    };
  };

  const createGeoJSONFile = async (): Promise<File> => {
    const { uploadType, coordinates, area, commodity, locationName } = uploadLocationState;

    const geometry =
      uploadType === UploadType.ByPoint
        ? { type: 'Point', coordinates: [coordinates[0].longitude, coordinates[0].latitude] }
        : mountPolygon(coordinates.map(({ longitude, latitude }) => [longitude, latitude]));

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

  const existingListId = uploadLocationState?.existingList?.id;

  const uploadList = async () => {
    if (uploadLocationState.uploadType === null) {
      return;
    }
    try {
      setIsConfirmationDialogOpen(false);
      setIsLoading(true);

      if (uploadLocationState.typeOfAnalysis.AFI) {
        gtag('event', 'User saved a list with Deforestation Reporting KPIs analysis selected', {
          event_category: 'Deforestation Reporting KPIs',
        });
      }

      let uploadedFile = uploadLocationState.uploadedFile;

      if ([UploadType.ByPoint, UploadType.ByPolygon].includes(uploadLocationState.uploadType)) {
        const geojsonFile = await createGeoJSONFile();

        uploadedFile = await uploadFileToS3(geojsonFile);
      }

      if (!uploadedFile) {
        setIsLoading(false);
        return;
      }

      const analysisIds = Object.keys(uploadLocationState.typeOfAnalysis).filter(
        (key) =>
          uploadLocationState.typeOfAnalysis[key as keyof typeof uploadLocationState.typeOfAnalysis]
      );

      await uploadProcessByPrevUploadedFile({
        listName,
        analysisIds,
        fileS3Route: uploadedFile.fileS3Route,
        keyFile: uploadedFile.keyFile,
        existingList: uploadLocationState.existingList,
        saveAsDraft: isDraftUpload.current,
        commodity: uploadLocationState.commodity,
      });
      updateSaveMode(isDraftUpload.current);

      if (existingListId) {
        // If updating an existing list, delete its vector tiles
        // they will be regenerated when the list is viewed on the map
        const response = await axios
          .post('/vectorTile/deleteTiles', {
            listID: existingListId,
          })
          .catch((error) => {
            errorLogger.apiError(error, {
              endpoint: '/vectorTile/deleteTiles',
              method: 'POST',
              component: 'SummaryAndSubmit',
              action: 'deleteTiles',
              listID: existingListId,
            });
          });
        errorLogger.info('Tile deletion response', { response });
      }

      history.push('SUBMISSION_SUCCESS');
    } catch (err) {
      setIsLoading(false);
      setIsErrorDialogOpen(true);
    }
  };

  const leadingText = existingListId
    ? 'You are adding locations to an existing list'
    : 'A new list will be created';

  const draftLocationsToList = useTransifexTranslation(
    `${leadingText}. Click OK to save your updated list as a draft. It will remain in draft mode until you choose to run the analysis. Note that running the analysis will count toward your account usage limits. See more information`
  );
  const submitLocationsToList = useTransifexTranslation(
    `${leadingText}. Please confirm that you want to submit this list for analysis. Note that running the analysis will count toward your account usage limits. See more information`
  );
  const linkHereText = useTransifexTranslation('here');
  const listNameText = useTransifexTranslation('List Name:');

  return (
    <>
      <NavBar />
      <Card sx={{ height: '634px', display: 'flex', flexDirection: 'column', pt: 1, px: 2, pb: 2 }}>
        <Typography variant="h6">Summary & Submit</Typography>

        <Box sx={{ mx: 'auto' }}>
          <Box
            sx={{
              padding: 1.25,
              borderRadius: 1,
              width: '500px',
              mt: 3,
              backgroundColor: 'background.default',
            }}
          >
            <Typography variant="body2">
              <span>{useTransifexTranslation('You are')}</span>{' '}
              {isAddingToNewList ? (
                <>
                  <span>{useTransifexTranslation('creating a new')}</span>{' '}
                  <span>
                    <b>{commodity}</b>
                  </span>{' '}
                  <span>{useTransifexTranslation('list named')}</span>{' '}
                  <span>
                    <b>{listName}</b>.
                  </span>
                </>
              ) : (
                <>
                  <span>{useTransifexTranslation('adding')}</span>{' '}
                  <span>
                    <b>{commodity}</b>
                  </span>{' '}
                  <span>{useTransifexTranslation('location(s) to the list named')}</span>{' '}
                  <span>
                    <b>{listName}</b>.
                  </span>
                </>
              )}
            </Typography>
            <Typography variant="body2">
              {isAddingToNewList ? 'Your ' : 'The resulting '}list will be submitted for the
              following analysis:
            </Typography>
            <Box component="ul" sx={{ color: 'text.secondary' }}>
              {Object.entries(uploadLocationState.typeOfAnalysis)
                .filter(
                  ([key, isChecked]) =>
                    isChecked &&
                    key !== analysisTypes.PALM_RISK &&
                    key !== AlertsAnalysisFrequency.WEEKLY
                )
                .map(([key]) => {
                  const analysis = analysisTypesOptionsNewNames.find((x) => x.id === key);

                  const isPalmRiskIncluded =
                    analysis?.id === 'FCD' && uploadLocationState.typeOfAnalysis.PalmRisk;

                  const isWeeklyAlertsIncluded =
                    isWeeklyAlertsAvailable &&
                    analysis?.id === 'ALERTS' &&
                    uploadLocationState.typeOfAnalysis.Weekly;

                  return (
                    <li key={key}>
                      <Typography variant="caption">{analysis?.label}</Typography>
                      {isPalmRiskIncluded && (
                        <Typography variant="caption"> (Includes Palm Risk Assessment)</Typography>
                      )}
                      {isWeeklyAlertsIncluded && (
                        <Typography variant="caption">
                          {' '}
                          (Includes {weeklyAlertsAnalysis.label})
                        </Typography>
                      )}
                    </li>
                  );
                })}
            </Box>

            <Typography variant="body2">
              Please note that all analysis submissions count towards your usage limits. See more
              information{' '}
              <Link
                href={ExternalLinks.UploadFees}
                sx={{ textDecoration: 'none', color: 'primary.main' }}
                target="_blank"
              >
                here
              </Link>
              .
            </Typography>
          </Box>
          <FileValidationHelper sx={{ mt: 1 }} />
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
            color="info"
            startIcon={<ArrowBackIos />}
            onClick={history.goBack}
            sx={{ mr: 'auto' }}
          >
            Back
          </PillButton>

          <PillButton
            variant="contained"
            color="info"
            startIcon={<Close />}
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[uploadLocationState.uploadType!].SUBMIT_CANCEL}
            onClick={clearUploadType}
          >
            Cancel
          </PillButton>
          <PillButton
            type="submit"
            color="secondary"
            variant="contained"
            startIcon={<EditNote />}
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[uploadLocationState.uploadType!].SUBMIT_DRAFT}
            onClick={() => {
              isDraftUpload.current = true;
              setIsConfirmationDialogOpen(true);
            }}
          >
            Save as draft
          </PillButton>
          <PillButton
            type="submit"
            variant="contained"
            startIcon={<Publish />}
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[uploadLocationState.uploadType!].SUBMIT_ANALYSIS}
            onClick={() => {
              isDraftUpload.current = false;
              setIsConfirmationDialogOpen(true);
            }}
          >
            Submit for analysis
          </PillButton>
        </Box>
      </Card>
      <LoadingModal isLoading={isLoading} />
      <Dialog open={isConfirmationDialogOpen}>
        <DialogTitle>
          <Typography variant="subtitle1">Are you sure?</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'justify' }}>
          <Typography variant="body2">
            <div>
              {isDraftUpload.current ? (
                <>
                  <span>{draftLocationsToList}</span>
                </>
              ) : (
                <span>{submitLocationsToList}</span>
              )}{' '}
              <Link
                href={ExternalLinks.UploadFees}
                sx={{ textDecoration: 'none', color: 'primary.main' }}
                target="_blank"
              >
                {linkHereText}
              </Link>
              .
            </div>
            <br />
            <div>{listNameText}</div>
            <div>
              <b>{listName}</b>
            </div>
          </Typography>
        </DialogContent>

        <DialogActions sx={{ mr: 'auto', ml: 1.5, pb: 2 }}>
          <PillButton
            variant="contained"
            sx={{ width: '150px' }}
            data-cy={
              isDraftUpload.current
                ? DATA_CY.NEW_UPLOAD_WORKFLOW[uploadLocationState.uploadType!].SUBMIT_DRAFT
                : DATA_CY.NEW_UPLOAD_WORKFLOW[uploadLocationState.uploadType!].SUBMIT_ANALYSIS
            }
            onClick={uploadList}
          >
            Ok
          </PillButton>
          <PillButton color="info" onClick={() => setIsConfirmationDialogOpen(false)}>
            Cancel
          </PillButton>
        </DialogActions>
      </Dialog>

      <Dialog open={isErrorDialogOpen}>
        <DialogContent>There was an error uploading your file. Please try again.</DialogContent>
        <DialogActions sx={{ m: 'auto' }}>
          <PillButton
            variant="contained"
            sx={{ width: '150px' }}
            onClick={() => setIsErrorDialogOpen(false)}
          >
            Ok
          </PillButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
