import React, { Fragment } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
// import CardActions from '@mui/material/CardActions';
// import GfwButton from '../../../../common/js/components/GfwButton';
import { profilePage } from '../../../../common/js/config';

/**
 * @summary Displays account usage data
 * @param {Object} props
 * @returns ReactNode
 */
export default function AccountProfile({
  total_area_analyzed,
  max_area_analyzed,
  subscriptionYearStart,
  subscriptionYearEnd,
}) {
  const accountActivationYearLabel = profilePage.accountUsage.title
    .replace('{subscriptionYearStart}', subscriptionYearStart)
    .replace('{subscriptionYearEnd}', subscriptionYearEnd);
  return (
    <Fragment>
      <Grid container>
        <Grid item xs={12}>
          <Typography
            sx={{ marginBottom: '1rem', textTransform: 'capitalize' }}
            variant="subtitle1"
          >
            {accountActivationYearLabel}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ padding: '1rem' }}>
            <CardContent>
              <Typography variant="h4">{Number(max_area_analyzed).toLocaleString()}</Typography>
              <Typography variant="caption" display="block" gutterBottom>
                {profilePage.accountUsage.usageAnalyzed}
              </Typography>
            </CardContent>
            {/* <CardActions sx={{ justifyContent: 'end' }}>
              <GfwButton classNames="btn-white" onClick={() => void 0} value="Details" />
            </CardActions> */}
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ padding: '1rem' }}>
            <CardContent>
              <Typography variant="h4">{Number(total_area_analyzed).toLocaleString()}</Typography>
              <Typography variant="caption" display="block" gutterBottom>
                {profilePage.accountUsage.totalAnalysis}
              </Typography>
            </CardContent>
            {/* <CardActions sx={{ justifyContent: 'end' }}>
              <GfwButton classNames="btn-green" onClick={() => void 0} value="Recharge" />
            </CardActions> */}
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
}
