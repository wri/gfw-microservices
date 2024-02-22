import React, { Fragment } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { profilePage } from '../../../../common/js/config';
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import AccountUsageContainer from './AccountUsageContent';

/**
 * @summary Displays account usage data
 * @param {Object} props
 * @returns ReactNode
 */
export default function AccountUsage({ total_area_analyzed, locations_analyzed, maxLocations, maxArea }) {

  const CardLabel = styled(Typography)(() => ({
    marginBottom: '30px',
    Color: 'rgba(0, 0, 0, 0.5)',
    fontSize: '15px',
  }));

  const calculatePercentage = (total, used) => {
    return used / total * 100
  }

  return (
    <Fragment>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ padding: '1rem' }}>
            <AccountUsageContainer 
              label={profilePage.accountUsage.locationsAnalyzed}
              usedValue={locations_analyzed}
              maxValue={maxLocations} />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ padding: '1rem' }}>
            <AccountUsageContainer 
              label={profilePage.accountUsage.areaAnalyzed}
              usedValue={total_area_analyzed}
              maxValue={maxArea} />
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
}
