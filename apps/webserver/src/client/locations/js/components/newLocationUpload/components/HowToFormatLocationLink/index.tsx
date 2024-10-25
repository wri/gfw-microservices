import React from 'react';

import { Typography, Link } from '@mui/material';
import SupportIcon from '@mui/icons-material/Support';
import NorthEastIcon from '@mui/icons-material/NorthEast';

type HowToFormatLocationLinkProps = {
  text: string;
  url: string;
};

export function HowToFormatLocationLink({ text, url }: HowToFormatLocationLinkProps) {
  return (
    <Link
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        width: 'fit-content',
        textDecoration: 'none',
      }}
      href={url}
    >
      <SupportIcon fontSize="small" />
      <Typography variant="body2" color="primary">
        {text}
      </Typography>
      <NorthEastIcon fontSize="small" />
    </Link>
  );
}
