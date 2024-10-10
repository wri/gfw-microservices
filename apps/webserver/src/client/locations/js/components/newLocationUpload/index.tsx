import React from 'react';
import './index.scss';
import { useHistory } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { IconButton, Typography } from '@mui/material';

import { UploadOptions } from './components/UploadOptions';

export function NewLocationUpload() {
  const history = useHistory();

  return (
    <div className="new-location-upload">
      <nav>
        <IconButton onClick={() => history.goBack()} disableRipple>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">Name of the list</Typography>
        <ArrowForwardIosIcon fontSize="small" />
        <Typography variant="h5">Add location</Typography>
      </nav>
      <UploadOptions />
    </div>
  );
}
