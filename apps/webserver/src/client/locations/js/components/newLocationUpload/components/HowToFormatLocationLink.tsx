import React from 'react';

import { Typography, Link } from '@mui/material';
import { Support, NorthEast } from '@mui/icons-material';

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
      <Support fontSize="small" />
      <Typography variant="body2" color="primary">
        {text}
      </Typography>
      <NorthEast fontSize="small" />
    </Link>
  );
}
