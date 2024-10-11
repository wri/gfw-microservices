import React from 'react';
import './index.scss';

import { useHistory } from 'react-router-dom';
import { Typography, Card, IconButton } from '@mui/material';
import UploadFileTwoToneIcon from '@mui/icons-material/UploadFileTwoTone';
import ScatterPlotTwoToneIcon from '@mui/icons-material/ScatterPlotTwoTone';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { UploadLocationOptionButton } from './components/UploadLocationOptionButton';
import { HowToFormatLocationLink } from '../components/HowToFormatLocationLink';

export function UploadLocationOptions() {
  const history = useHistory();

  return (
    <div className="upload-location-options">
      <nav>
        <IconButton onClick={() => history.goBack()} disableRipple>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">Name of the list</Typography>
        <ArrowForwardIosIcon fontSize="small" />
        <Typography variant="h5">Add location</Typography>
      </nav>
      <Card className="upload-location-options__main-content">
        <div>
          <Typography variant="h6">Add Location</Typography>
          <Typography variant="body2" className="upload-location-options__main-content__subtitle">
            GFW Pro allows users to upload their data in multiple ways.
          </Typography>
          <HowToFormatLocationLink />
        </div>
        <div className="upload-location-options__main-content__options">
          <Typography variant="body2">
            Best for multiple location or if your data is contained within a file.
          </Typography>
          <UploadLocationOptionButton
            Icon={UploadFileTwoToneIcon}
            text="File upload"
            onClick={() => console.log('clicked')}
          />
          <div className="upload-location-options__main-content__options__other-options">
            <Typography variant="body2">Or</Typography>
            <Typography variant="body2">
              If you would like to enter a single location without uploading a file, you can define
              your location via one of our interactive workflows:
            </Typography>
            <div>
              <UploadLocationOptionButton
                Icon={ScatterPlotTwoToneIcon}
                text="Point"
                onClick={() => console.log('clicked')}
              />
              <UploadLocationOptionButton
                Icon={TimelineIcon}
                text="Polygon"
                onClick={() => console.log('clicked')}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
