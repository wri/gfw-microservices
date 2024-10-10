import React from 'react';
import './index.scss';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { UploadOptions } from './components/UploadOptions';
import { Typography } from '@mui/material';

export function NewLocationUpload() {
  return (
    <div className="new-location-upload">
      <nav>
        <ArrowBackIcon />
        <Typography variant="h5">Name of the list</Typography>
        <ArrowForwardIosIcon fontSize="small" />
        <Typography variant="h5">Add location</Typography>
      </nav>
      <UploadOptions />
    </div>
  );
}
