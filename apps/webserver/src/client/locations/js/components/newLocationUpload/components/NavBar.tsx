import { useEffect, useState } from 'react';
import { IconButton, Stepper, Step, StepLabel, Typography, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import { useUploadLocation } from '../contexts';
import { UploadType } from '../types';
import { useLocation } from 'react-router-dom';
import { UploadLocationRoutes } from '../UploadLocationRouter';

type NavBarProps = {
  isComingFromMap?: boolean;
};

export function NavBar({ isComingFromMap }: NavBarProps) {
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
    const isUploadByFileOrById = uploadType === UploadType.ByFile || uploadType === UploadType.ById;
    setSteps(isUploadByFileOrById ? stepsForUploadByFile : stepsForUploadByLocation);
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
      <IconButton
        onClick={() => (isComingFromMap ? null : clearUploadType())}
        href={isComingFromMap ? '/map' : null}
        disableRipple
      >
        <ArrowBack />
      </IconButton>
      <Typography variant="h5" sx={{ minWidth: 'fit-content' }}>
        {isComingFromMap ? 'Map' : 'New Location'}
      </Typography>

      <Stepper
        activeStep={activeStep()}
        sx={{
          width: '100%',
          ml: 8,
          // Completed (previous) steps use a neutral grey so they don't visually
          // compete with the current active step, which stays green.
          '& .MuiStepIcon-root.Mui-completed': {
            color: (theme) => theme.palette.neutral?.[400] ?? theme.palette.grey[400],
          },
        }}
      >
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
