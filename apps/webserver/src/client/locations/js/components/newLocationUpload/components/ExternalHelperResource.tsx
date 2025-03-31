import React from 'react';

import { Typography, Link } from '@mui/material';
import { Support, NorthEast } from '@mui/icons-material';

type ExternalHelperResourceProps = {
  text: string;
  url: string;
};

export function ExternalHelperResource({ text, url }: ExternalHelperResourceProps) {
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
      target="_blank"
    >
      <Support fontSize="small" />
      <Typography variant="body2" color="primary" lineHeight="0">
        {text}
      </Typography>
      <NorthEast fontSize="small" />
    </Link>
  );
}
