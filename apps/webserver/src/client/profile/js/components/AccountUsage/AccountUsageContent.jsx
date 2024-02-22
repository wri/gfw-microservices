import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

export default function AccountUsage({ label, usedValue, maxValue }) {

  const CardLabel = styled(Typography)(() => ({
    marginBottom: '30px',
    Color: 'rgba(0, 0, 0, 0.5)',
    fontSize: '15px',
  }));

  const calculatePercentage = usedValue / maxValue * 100;

  return (
    <CardContent>
      <CardLabel variant="caption" display="block" gutterBottom>
        {label}
      </CardLabel>

      <Grid 
        container
        direction="row"
        justifyContent="space-between"
        alignItems="stretch">

        <Grid item>
          <CardLabel variant="caption" display="block">
            Used
          </CardLabel>
          <Typography variant="span">{usedValue}</Typography>
        </Grid>

        <Grid item>
          <CardLabel variant="caption" display="block">
            Avaliable
          </CardLabel>
          <span>{maxValue - usedValue}</span> / <span>{maxValue}</span>
        </Grid>
      </Grid>

      <LinearProgress variant="determinate" value={calculatePercentage} />
    </CardContent>
  );
}
