import React from 'react';
import { RectangleButtonWithIcon } from './components/RectangleButtonWithIcon';

import UploadFileTwoToneIcon from '@mui/icons-material/UploadFileTwoTone';
import ScatterPlotTwoToneIcon from '@mui/icons-material/ScatterPlotTwoTone';
import TimelineIcon from '@mui/icons-material/Timeline';

import './index.scss';

export function NewLocationUpload() {
  return (
    <div className="new-location-upload">
      <div>
        <h3>Add Location</h3>
        <p>GFW Pro allows for users to upload their data in multiple ways.</p>
        <div>
          <span>How to format your location data for GFW Pro</span>
        </div>
      </div>
      <div className="new-location-upload__upload-options">
        <p>Best for multiple location or if your data is contained within a file.</p>
        <RectangleButtonWithIcon
          Icon={UploadFileTwoToneIcon}
          text="File upload"
          onClick={() => console.log('clicked')}
        />
        <div className="new-location-upload__upload-options__bottom-options">
          <p>Or</p>
          <p>
            If you would like to enter a single location without uploading a file, you can define
            your location via one of our interactive workflows:
          </p>
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
    </div>
  );
}
