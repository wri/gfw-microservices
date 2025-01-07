import React, { useState, FormEvent } from 'react';
import { Box, Card, Link, Typography } from '@mui/material';
import { ArrowBackIos, Close, EditNote, Publish } from '@mui/icons-material';

import { useHistory } from '../hooks';
import { LoadingModal, PillButton } from '../../../../../components';
import { useUploadLocation } from '../contexts';
import { NavBar } from '../components';
import { analysisTypesOptionsNewNames } from '../../../../../../config/env/analysisTypes.constants';

export function SummaryAndSubmit() {
  const history = useHistory();
  const { clearUploadType, uploadLocationState } = useUploadLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = (e: FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsLoading(true);
  };

  const isAddingToNewList = !!uploadLocationState.newListName;

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
                creating a new <b>{uploadLocationState.commodity}</b> list named{' '}
                <b>{uploadLocationState.newListName}</b>.
              </>
            ) : (
              <>
                adding <b>{uploadLocationState.commodity}</b> location(s) to the list named{' '}
                <b>{uploadLocationState.existingListName}</b>.
              </>
            )}
          </Typography>
          <Typography variant="body2">
            Ï{isAddingToNewList ? 'Your ' : 'The resulting '}list will be submitted for the
            following analysis:
          </Typography>
          Ï
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
          Ï
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
          <PillButton type="submit" variant="contained" startIcon={<Publish />}>
            Submit for analysis
          </PillButton>
        </Box>
      </Card>
      <LoadingModal isLoading={isLoading} />
    </>
  );
}
