import React, { useState } from 'react';
import './index.scss';

import { UploadLocationOptions } from './UploadLocationOptions';
import { UploadLocationByPoint } from './UploadLocationByPoint';

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
    <div className="new-location-upload">
      {uploadType === UploadType.BY_POINT ? (
        <UploadLocationByPoint clearUploadType={clearUploadType} />
      ) : (
        <UploadLocationOptions selectUploadType={selectUploadType} />
      )}
    </div>
  );
}
