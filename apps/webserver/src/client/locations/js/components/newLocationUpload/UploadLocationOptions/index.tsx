import React from 'react';
import './index.scss';

import { useHistory } from 'react-router-dom';
import { Typography, Card, IconButton, Button } from '@mui/material';
import UploadFileTwoToneIcon from '@mui/icons-material/UploadFileTwoTone';
import ScatterPlotTwoToneIcon from '@mui/icons-material/ScatterPlotTwoTone';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { HowToFormatLocationLink } from '../components/HowToFormatLocationLink';
import { UploadType } from '..';

type UploadLocationOptionsProps = {
  selectUploadType: (type: UploadType) => void;
};

export function UploadLocationOptions({ selectUploadType }: UploadLocationOptionsProps) {
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
          <HowToFormatLocationLink text="How to format your location data for GFW Pro" url="#" />
        </div>
        <div className="upload-location-options__main-content__options">
          <Typography variant="body2">
            Best for multiple location or if your data is contained within a file.
          </Typography>

          <Button
            className="upload-location-options__button"
            onClick={() => selectUploadType(UploadType.BY_FILE)}
            startIcon={<UploadFileTwoToneIcon />}
            disableRipple
          >
            File upload
          </Button>
          <div className="upload-location-options__main-content__options__other-options">
            <Typography variant="body2">Or</Typography>
            <Typography variant="body2">
              If you would like to enter a single location without uploading a file, you can define
              your location via one of our interactive workflows:
            </Typography>
            <div>
              <Button
                className="upload-location-options__button"
                onClick={() => selectUploadType(UploadType.BY_POINT)}
                startIcon={<ScatterPlotTwoToneIcon />}
                disableRipple
              >
                Point
              </Button>

              <Button
                className="upload-location-options__button"
                onClick={() => selectUploadType(UploadType.BY_POLYGON)}
                startIcon={<TimelineIcon />}
                disableRipple
              >
                Polygon
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
