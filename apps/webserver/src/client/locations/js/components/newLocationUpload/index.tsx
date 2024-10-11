import React from 'react';
import './index.scss';

import { UploadOptions } from './UploadOptions';
// import { UploadByPoint } from './UploadByPoint';

export function NewLocationUpload() {
  return (
    <div className="new-location-upload">
      <UploadOptions />
    </div>
  );
}
