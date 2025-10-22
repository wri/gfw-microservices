import { Card, Grid, Typography, CardContent, styled } from '@mui/material';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { formatNumber } from '../../../../common/js/utils/format';
import InfoBubble from '../../../../common/js/components/InfoBubble';

export default function AccountUsage({ label, usedValue, maxValue, InfoBubbleContent }) {
  const getProgressColor = () => {
    if (usagePercentage === 100) {
      return 'rgba(242, 78, 30, 0.73)';
    }

    if (usagePercentage > 90) {
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
    color: 'rgba(0, 0, 0, 0.73)',
    fontSize: '13px',
    fontWeight: 'bold',
  }));

  const ProgressLabel = styled(Typography)(() => ({
    color: getProgressColor(),
    fontSize: '14px',
    lineHeight: '36px',
    fontWeight: 'bold',
  }));

  const usagePercentage = maxValue > usedValue ? (usedValue / maxValue) * 100 : 100;

  return (
    <Card sx={{ padding: '1rem' }}>
      <CardContent>
        <CardLabel style={{ marginBottom: '30px' }} variant="span" display="block" gutterBottom>
          {label}
          <InfoBubble>
            <InfoBubbleContent />
          </InfoBubble>
        </CardLabel>

        <Grid container direction="row" justifyContent="space-between" alignItems="baseline">
          <Grid item>
            <CardLabel variant="caption" display="block">
              Allocated
            </CardLabel>
            <ProgressLabel variant="span">{formatNumber(maxValue)}</ProgressLabel>
          </Grid>

          <Grid item>
            <CardLabel variant="caption" display="block">
              Used
            </CardLabel>
            <ProgressLabel variant="span">{formatNumber(usedValue)}</ProgressLabel>
          </Grid>

          <Grid item>
            <CardLabel variant="caption" display="block" style={{ textAlign: 'right' }}>
              Remaining
            </CardLabel>
            <ProgressLabel variant="span">{formatNumber(maxValue - usedValue)}</ProgressLabel>
          </Grid>
        </Grid>

        <BorderLinearProgress variant="determinate" value={usagePercentage} />
      </CardContent>
    </Card>
  );
}
