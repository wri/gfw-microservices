import React from 'react';
import './index.scss';

import { Typography, IconButton, Stepper, Step, StepLabel } from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type NavBarWithProgressProps = {
  clearUploadType: () => void;
  steps: string[];
  activeStep: number;
};

export function NavBarWithProgress({
  clearUploadType,
  steps,
  activeStep,
}: NavBarWithProgressProps) {
  return (
    <nav className="nav-bar-with-progress">
      <IconButton onClick={clearUploadType} disableRipple>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h5">New Location</Typography>

      <Stepper activeStep={activeStep} sx={{ width: '100%', marginLeft: '4rem' }}>
        {steps.map((label) => {
          return (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </nav>
  );
}
