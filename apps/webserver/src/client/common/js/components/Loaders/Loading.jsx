import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const loadingStyles = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'white',
  zIndex: 1,
};

export default function Loading() {
  return (
    <Box sx={loadingStyles}>
      <CircularProgress color="success" />
    </Box>
  );
}
