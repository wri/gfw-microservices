import React, { Fragment } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { profilePage } from '../../../../common/js/config';
import { styled } from '@mui/material/styles';

/**
 * @summary Displays account usage data
 * @param {Object} props
 * @returns ReactNode
 */
export default function AccountProfile({
  total_area_analyzed,
  max_area_analyzed,
}) {

  const CardLabel = styled(Typography)(() => ({
    marginBottom: '30px',
    Color: 'rgba(0, 0, 0, 0.5)',
    fontSize: '15px'
  }));

  return (
    <Fragment>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ padding: '1rem' }}>
            <CardContent>
              <CardLabel variant="caption" display="block" gutterBottom>
                {profilePage.accountUsage.usageAnalyzed}
              </CardLabel>
              <Typography variant="h4">{Number(max_area_analyzed).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ padding: '1rem' }}>
            <CardContent>
              <CardLabel variant="caption" display="block" gutterBottom>
                {profilePage.accountUsage.totalAnalysis}
              </CardLabel>
              <Typography variant="h4">{Number(total_area_analyzed).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
}
