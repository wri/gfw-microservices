import React from 'react';
import './index.scss';

import { UploadLocationOptions } from './UploadLocationOptions';
// import { UploadLocationByPoint } from './UploadLocationByPoint';

export function NewLocationUpload() {
  return (
    <div className="new-location-upload">
      <UploadLocationOptions />
    </div>
  );
}
