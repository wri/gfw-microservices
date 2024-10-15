import React from 'react';
import './index.scss';

import { Typography } from '@mui/material';
import SupportIcon from '@mui/icons-material/Support';
import NorthEastIcon from '@mui/icons-material/NorthEast';

type HowToFormatLocationLinkProps = {
  text: string;
  url: string;
};

export function HowToFormatLocationLink({ text, url }: HowToFormatLocationLinkProps) {
  return (
    <a className="how-to-format-location-link" href={url}>
      <SupportIcon />
      <Typography variant="body2">{text}</Typography>
      <NorthEastIcon />
    </a>
  );
}
