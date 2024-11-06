import './index.scss';

import React from 'react';
import { useHistory } from 'react-router-dom';
import { Typography, Card, IconButton, Button } from '@mui/material';
import {
  UploadFileTwoTone,
  ScatterPlotTwoTone,
  Timeline,
  ArrowBack,
  ArrowForwardIos,
} from '@mui/icons-material';

import { HowToFormatLocationLink } from '../components/HowToFormatLocationLink';
import { UploadType } from '..';
import { ChangePageType } from '../types';

export function UploadLocationOptions({ setUploadType }: ChangePageType) {
  const history = useHistory();

  return (
    <div className="upload-location-options">
      <nav>
        <IconButton onClick={() => history.goBack()}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5">Name of the list</Typography>
        <ArrowForwardIos fontSize="small" />
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
            onClick={() => setUploadType(UploadType.ByFile)}
            startIcon={<UploadFileTwoTone color="primary" fontSize="large" />}
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
                onClick={() => setUploadType(UploadType.ByPoint)}
                startIcon={<ScatterPlotTwoTone color="primary" fontSize="large" />}
              >
                Point
              </Button>

              <Button
                className="upload-location-options__button"
                onClick={() => setUploadType(UploadType.ByPolygon)}
                startIcon={<Timeline color="primary" fontSize="large" />}
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
