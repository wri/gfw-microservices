import React from 'react';
import './index.scss';

import { Typography, Card } from '@mui/material';
import UploadFileTwoToneIcon from '@mui/icons-material/UploadFileTwoTone';
import ScatterPlotTwoToneIcon from '@mui/icons-material/ScatterPlotTwoTone';
import TimelineIcon from '@mui/icons-material/Timeline';
import SupportIcon from '@mui/icons-material/Support';
import NorthEastIcon from '@mui/icons-material/NorthEast';

import { RectangleButtonWithIcon } from '../RectangleButtonWithIcon';

export function UploadOptions() {
  return (
    <Card className="upload-options">
      <div>
        <Typography variant="h6">Add Location</Typography>
        <Typography variant="body2" className="upload-options__subtitle">
          GFW Pro allows for users to upload their data in multiple ways.
        </Typography>
        <a className="upload-options__how-to-info-link" href="#">
          <SupportIcon />
          <Typography variant="body2">How to format your location data for GFW Pro</Typography>
          <NorthEastIcon />
        </a>
      </div>
      <div className="upload-options__options">
        <Typography variant="body2">
          Best for multiple location or if your data is contained within a file.
        </Typography>
        <RectangleButtonWithIcon
          Icon={UploadFileTwoToneIcon}
          text="File upload"
          onClick={() => console.log('clicked')}
        />
        <div className="upload-options__options__other-options">
          <Typography variant="body2">Or</Typography>
          <Typography variant="body2">
            If you would like to enter a single location without uploading a file, you can define
            your location via one of our interactive workflows:
          </Typography>
          <div>
            <RectangleButtonWithIcon
              Icon={ScatterPlotTwoToneIcon}
              text="Point"
              onClick={() => console.log('clicked')}
            />
            <RectangleButtonWithIcon
              Icon={TimelineIcon}
              text="Polygon"
              onClick={() => console.log('clicked')}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
