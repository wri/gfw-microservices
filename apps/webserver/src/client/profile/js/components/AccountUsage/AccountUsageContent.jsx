import { Card, Grid, Typography, CardContent, styled } from '@mui/material';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { formatNumber } from '../../../../common/js/utils/format';
import InfoBubble from '../../../../common/js/components/InfoBubble';

const getProgressColor = (usagePercentage = 0) => {
  if (usagePercentage === 100) {
    return 'rgba(242, 78, 30, 0.73)';
  }

  if (usagePercentage > 90) {
    return 'rgba(255, 138, 0, 0.73)';
  }

  return 'rgba(0, 0, 0, 0.73)';
};

const CardLabel = styled(Typography)({
  color: '#8b8b8b',
  fontSize: '13px',
  fontWeight: 'normal',
  marginBottom: '0.75rem',
});

const CardValue = styled(CardLabel)(() => ({
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '0.35rem',
}));

const LinearProgressBar = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== 'usagePercentage',
})(({ usagePercentage }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: getProgressColor(usagePercentage),
  },
}));

export default function AccountUsage({ label, usedValue = 0, maxValue = 0, InfoBubbleContent }) {
  const usagePercentage = maxValue > 0 ? (usedValue / maxValue) * 100 : 0;

  return (
    <Card>
      <CardContent>
        <CardLabel sx={{ marginBottom: '30px' }} variant="span" display="block" gutterBottom>
          {label}
          <InfoBubble>
            <InfoBubbleContent />
          </InfoBubble>
        </CardLabel>

        <Grid container direction="row" justifyContent="space-between" alignItems="baseline">
          <Grid item display="flex" flexDirection="column">
            <CardValue
              sx={{
                color: getProgressColor(usagePercentage),
              }}
              variant="span"
            >
              {formatNumber(maxValue)}
            </CardValue>
            <CardLabel variant="caption" display="block">
              Allocated
            </CardLabel>
          </Grid>

          <Grid item display="flex" flexDirection="column">
            <CardValue
              sx={{
                color: getProgressColor(usagePercentage),
              }}
              variant="span"
            >
              {formatNumber(usedValue)}
            </CardValue>
            <CardLabel variant="caption" display="block">
              Used
            </CardLabel>
          </Grid>

          <Grid item display="flex" flexDirection="column">
            <CardValue
              sx={{
                color: getProgressColor(usagePercentage),
              }}
              variant="span"
            >
              {formatNumber(maxValue - usedValue)}
            </CardValue>
            <CardLabel variant="caption" display="block" sx={{ textAlign: 'right' }}>
              Remaining
            </CardLabel>
          </Grid>
        </Grid>

        <Grid container direction="column">
          <Grid item>
            <LinearProgressBar
              variant="determinate"
              value={usagePercentage}
              usagePercentage={usagePercentage}
            />
          </Grid>
          <Grid item alignSelf="flex-end" sx={{ paddingTop: '0.35em' }}>
            <CardLabel variant="caption">
              {formatNumber(usedValue)}/{formatNumber(maxValue)}
            </CardLabel>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
