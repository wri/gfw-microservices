import { useEffect, useState } from 'react';
import { IconButton, Stepper, Step, StepLabel, Typography, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import { useUploadLocation } from '../contexts';
import { UploadType } from '../types';
import { useLocation } from 'react-router-dom';
import { UploadLocationRoutes } from '../UploadLocationRouter';

export function NavBar() {
  const {
    clearUploadType,
    uploadLocationState: { uploadType },
  } = useUploadLocation();
  const location = useLocation();

  const stepsForUploadByLocation = ['Location', 'Configure List', 'Submit'];
  const stepsForUploadByFile = ['Prepare & Upload', 'Preview', 'Configure List', 'Submit'];

  const [steps, setSteps] = useState(stepsForUploadByLocation);

  const getStepIndex = (path: string) => {
    const stepMap = {
      [UploadLocationRoutes.CONFIGURE_LIST]: 'Configure List',
      [UploadLocationRoutes.PREVIEW]: 'Preview',
      [UploadLocationRoutes.SUMMARY_AND_SUBMIT]: 'Submit',
    };

    const step = stepMap[path as keyof typeof stepMap];
    return step ? steps.indexOf(step) : 0;
  };

  const activeStep = () => getStepIndex(location.pathname);

  useEffect(() => {
    const isUploadByFile = uploadType === UploadType.ByFile;
    setSteps(isUploadByFile ? stepsForUploadByFile : stepsForUploadByLocation);
  }, [uploadType]);

  return (
    <Box
      component="nav"
      sx={{
        display: { sm: 'flex', xs: 'block' },
        alignItems: 'center',
        gap: 1.5,
        mb: 4,
      }}
    >
      <IconButton onClick={clearUploadType} disableRipple>
        <ArrowBack />
      </IconButton>
      <Typography variant="h5" sx={{ minWidth: 'fit-content' }}>
        New Location
      </Typography>

      <Stepper activeStep={activeStep()} sx={{ width: '100%', ml: 8 }}>
        {steps.map((label) => {
          return (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}
