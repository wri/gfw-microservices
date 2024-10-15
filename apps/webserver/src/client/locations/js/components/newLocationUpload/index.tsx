import React from 'react';
import './index.scss';

import { UploadLocationOptions } from './UploadLocationOptions';
import { UploadLocationByPoint } from './UploadLocationByPoint';
import { UploadType, useUploadType } from './hooks/UploadTypeContext';

export function NewLocationUpload() {
  const { uploadType } = useUploadType();

  return (
    <div className="new-location-upload">
      {uploadType === UploadType.BY_POINT ? <UploadLocationByPoint /> : <UploadLocationOptions />}
    </div>
  );
}
