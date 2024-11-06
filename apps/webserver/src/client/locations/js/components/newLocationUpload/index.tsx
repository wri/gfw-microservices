import './index.scss';

import React, { useEffect, useState } from 'react';
import { IconButton, Stepper, Step, StepLabel, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import { ThemeProvider } from '../../../../styles/ThemeProvider';
import { UploadLocationOptions } from './UploadLocationOptions';
import { UploadLocationByFile } from './UploadLocationByFile';
import { UploadLocationByPoint } from './UploadLocationByPoint';
import { UploadLocationByPolygon } from './UploadLocationByPolygon';

export enum UploadType {
  ByFile,
  ByPoint,
  ByPolygon,
}

export enum ActiveComponent {
  UploadOptions,
  UploadByFile,
  UploadByPoint,
  UploadByPolygon,
}

const mapUploadTypeToActiveComponent = {
  [UploadType.ByFile]: ActiveComponent.UploadByFile,
  [UploadType.ByPoint]: ActiveComponent.UploadByPoint,
  [UploadType.ByPolygon]: ActiveComponent.UploadByPolygon,
};

export function NewLocationUpload() {
  const [uploadType, setUploadType] = useState<UploadType | null>(null);
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>(
    ActiveComponent.UploadOptions
  );

  const selectUploadType = (type: UploadType) => {
    setUploadType(type);
  };

  const clearUploadType = () => {
    setUploadType(null);
  };

  const steps = ['Location', 'Configure List', 'Submit'];
  const [activeStep] = useState(0);

  useEffect(() => {
    if (uploadType === null) {
      setActiveComponent(ActiveComponent.UploadOptions);
      return;
    }

    setActiveComponent(mapUploadTypeToActiveComponent[uploadType]);
  }, [uploadType]);

  const ActiveComponentMap: { [key in ActiveComponent]: React.JSX.Element } = {
    [ActiveComponent.UploadOptions]: <UploadLocationOptions selectUploadType={selectUploadType} />,
    [ActiveComponent.UploadByFile]: <UploadLocationByFile />,
    [ActiveComponent.UploadByPoint]: <UploadLocationByPoint clearUploadType={clearUploadType} />,
    [ActiveComponent.UploadByPolygon]: (
      <UploadLocationByPolygon clearUploadType={clearUploadType} />
    ),
  };

  return (
    <ThemeProvider>
      <div className="new-location-upload">
        {activeComponent !== ActiveComponent.UploadOptions && (
          <nav>
            <IconButton onClick={clearUploadType} disableRipple>
              <ArrowBack />
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
        )}
        {ActiveComponentMap[activeComponent]}
      </div>
    </ThemeProvider>
  );
}
