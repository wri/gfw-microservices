import './index.scss';

import React, { useEffect, useState } from 'react';
import { IconButton, Stepper, Step, StepLabel, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import { ThemeProvider } from '../../../../styles/ThemeProvider';
import { UploadLocationOptions } from './UploadLocationOptions';
import { UploadLocationByFile } from './UploadLocationByFile';
import { UploadLocationByPoint } from './UploadLocationByPoint';
import { UploadLocationByPolygon } from './UploadLocationByPolygon';

import { UploadType } from './types/index';
import { ConfigureList } from './ConfigureList';

export enum ActiveComponent {
  UploadOptions,
  UploadByFile,
  UploadByPoint,
  UploadByPolygon,
  ConfigureList,
}

const mapUploadTypeToActiveComponent = {
  [UploadType.ByFile]: ActiveComponent.UploadByFile,
  [UploadType.ByPoint]: ActiveComponent.UploadByPoint,
  [UploadType.ByPolygon]: ActiveComponent.UploadByPolygon,
  ConfigureList: ActiveComponent.ConfigureList,
};

export function NewLocationUpload() {
  const [uploadType, setUploadType] = useState<UploadType | null>(null);
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>(
    ActiveComponent.UploadOptions
  );

  const selectUploadType = (type: UploadType | null) => {
    setUploadType(type);
  };

  const selectActiveComponent = (activeComponent: ActiveComponent) => {
    setActiveComponent(activeComponent);
  };

  const stepsForUploadByLocation = ['Location', 'Configure List', 'Submit'];
  const stepsForUploadByFile = ['Prepare & Upload', 'Preview', 'Configure List', 'Submit'];

  const [steps, setSteps] = useState({ data: stepsForUploadByLocation, active: 0 });

  useEffect(() => {
    if (uploadType === null) {
      setActiveComponent(ActiveComponent.UploadOptions);
      return;
    }

    const isUploadByFile = uploadType === UploadType.ByFile;
    setSteps((steps) => ({
      ...steps,
      data: isUploadByFile ? stepsForUploadByFile : stepsForUploadByLocation,
    }));

    setActiveComponent(mapUploadTypeToActiveComponent[uploadType]);
  }, [uploadType]);

  const ActiveComponentMap: { [key in ActiveComponent]: React.JSX.Element } = {
    [ActiveComponent.UploadOptions]: (
      <UploadLocationOptions
        setUploadType={selectUploadType}
        setActiveComponent={selectActiveComponent}
      />
    ),
    [ActiveComponent.UploadByFile]: (
      <UploadLocationByFile
        setUploadType={selectUploadType}
        setActiveComponent={selectActiveComponent}
      />
    ),
    [ActiveComponent.UploadByPoint]: (
      <UploadLocationByPoint
        setUploadType={selectUploadType}
        setActiveComponent={selectActiveComponent}
      />
    ),
    [ActiveComponent.UploadByPolygon]: (
      <UploadLocationByPolygon
        setUploadType={selectUploadType}
        setActiveComponent={selectActiveComponent}
      />
    ),
    [ActiveComponent.ConfigureList]: (
      <ConfigureList setUploadType={selectUploadType} setActiveComponent={selectActiveComponent} />
    ),
  };

  return (
    <ThemeProvider>
      <div className="new-location-upload">
        {activeComponent !== ActiveComponent.UploadOptions && (
          <nav>
            <IconButton onClick={() => setUploadType(null)} disableRipple>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5">New Location</Typography>

            <Stepper activeStep={steps.active} sx={{ width: '100%', marginLeft: '4rem' }}>
              {steps.data.map((label) => {
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
