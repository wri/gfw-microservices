import React from 'react';
import './index.scss';

import { Typography } from '@mui/material';
import SupportIcon from '@mui/icons-material/Support';
import NorthEastIcon from '@mui/icons-material/NorthEast';

export function HowToFormatLocationLink() {
  return (
    <a className="how-to-format-location-link" href="#">
      <SupportIcon />
      <Typography variant="body2">How to format your location data for GFW Pro</Typography>
      <NorthEastIcon />
    </a>
  );
}
