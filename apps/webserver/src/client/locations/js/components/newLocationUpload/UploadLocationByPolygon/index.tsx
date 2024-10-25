import React from 'react';
import './index.scss';

import { NavBarWithProgress } from '../components';

type UploadLocationByPointProps = {
  clearUploadType: () => void;
};

export function UploadLocationByPolygon({ clearUploadType }: UploadLocationByPointProps) {
  const steps = ['Location', 'Configure List', 'Submit'];
  const [activeStep] = React.useState(0);

  return (
    <div className="upload-location-by-polygon">
      <NavBarWithProgress clearUploadType={clearUploadType} steps={steps} activeStep={activeStep} />

      <h1>Upload Location by Polygon</h1>
    </div>
  );
}
