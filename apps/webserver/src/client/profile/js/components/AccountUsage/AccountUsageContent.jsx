import React from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { styled } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

export default function AccountUsage({ label, usedValue, maxValue }) {
  const getProgressColor = () => {
    if (calculatePercentage === 0) {
      return 'rgba(242, 78, 30, 0.73)';
    }

    if (calculatePercentage > 90) {
      return 'rgba(255, 138, 0, 0.73)';
    }

    return 'rgba(0, 0, 0, 0.73)';
  };

  const BorderLinearProgress = styled(LinearProgress)(() => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: getProgressColor(),
    },
  }));

  const CardLabel = styled(Typography)(() => ({
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: '12px',
  }));

  const ProgressLabel = styled(Typography)(() => ({
    color: getProgressColor(),
    fontSize: '14px',
    lineHeight: '36px',
    fontWeight: 'bold',
  }));

  const ProgressMark = styled(Typography)(() => ({
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: '12px',
    lineHeight: '36px',
  }));

  const formatNumber = (number) => {
    return number >= 1000000 ? (number / 1000000).toFixed(2) + 'M' : number;
  }

  const calculatePercentage = maxValue > usedValue ? (usedValue / maxValue) * 100 : 100;

  return (
    <Card sx={{ padding: '1rem' }}>
      <CardContent>
        <CardLabel style={{ marginBottom: '30px' }} variant="span" display="block" gutterBottom>
          {label}
        </CardLabel>

        <Grid container direction="row" justifyContent="space-between" alignItems="baseline">
          <Grid item>
            <CardLabel variant="span" display="block">
              Used
            </CardLabel>
            <ProgressLabel variant="span">{formatNumber(usedValue)}</ProgressLabel>
          </Grid>

          <Grid item>
            <CardLabel variant="caption" display="block" style={{ textAlign: 'right' }}>
              Available
            </CardLabel>
            <ProgressLabel variant="span">{formatNumber(maxValue - usedValue)}</ProgressLabel>
            <ProgressMark variant="span">/{formatNumber(maxValue)}</ProgressMark>
          </Grid>
        </Grid>

        <BorderLinearProgress variant="determinate" value={calculatePercentage} />
      </CardContent>
    </Card>
  );
}
