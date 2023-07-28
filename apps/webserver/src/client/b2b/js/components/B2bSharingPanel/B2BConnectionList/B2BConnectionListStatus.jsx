import React from 'react';
import Chip from '@mui/material/Chip';

const CONNECTION_STATUS_COLORS = {
  connected: '#4caf50',
  expired: '#9e9e9e',
  pending: '#2096f3',
};

export default function B2BConnectionListStatus({ status }) {
  return (
    <Chip
      label={status}
      sx={{
        backgroundColor: CONNECTION_STATUS_COLORS[status],
        color: 'white',
        textTransform: 'capitalize',
      }}
    />
  );
}
