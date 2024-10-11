import React from 'react';
import './index.scss';

import { UploadOptions } from './components/UploadOptions';

export function NewLocationUpload() {
  return (
    <div className="new-location-upload">
      <UploadOptions />
    </div>
  );
}
