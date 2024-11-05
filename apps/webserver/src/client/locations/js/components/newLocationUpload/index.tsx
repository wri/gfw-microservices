import React, { useState } from 'react';
import './index.scss';

import { ThemeProvider } from '../../../../styles/ThemeProvider';

import { UploadLocationOptions } from './UploadLocationOptions';
import { UploadLocationByPoint } from './UploadLocationByPoint';
import { UploadLocationByPolygon } from './UploadLocationByPolygon';

export enum UploadType {
  BY_FILE,
  BY_POINT,
  BY_POLYGON,
}

export function NewLocationUpload() {
  const [uploadType, setUploadType] = useState<UploadType | null>(null);

  const selectUploadType = (type: UploadType) => {
    setUploadType(type);
  };

  const clearUploadType = () => {
    setUploadType(null);
  };

  return (
    <ThemeProvider>
      <div className="new-location-upload">
        {uploadType === UploadType.BY_POINT ? (
          <UploadLocationByPoint clearUploadType={clearUploadType} />
        ) : uploadType === UploadType.BY_POLYGON ? (
          <UploadLocationByPolygon clearUploadType={clearUploadType} />
        ) : (
          <UploadLocationOptions selectUploadType={selectUploadType} />
        )}
      </div>
    </ThemeProvider>
  );
}
