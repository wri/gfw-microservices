import React, { Fragment } from 'react';
import Grid from '@mui/material/Grid';
import { profilePage } from '../../../../common/js/config';
import AccountUsageContainer from './AccountUsageContent';

/**
 * @summary Displays account usage data
 * @param {Object} props
 * @returns ReactNode
 */
export default function AccountUsage({ total_area_analyzed, locations_analyzed, maxLocations, maxArea }) {

  return (
    <Fragment>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <AccountUsageContainer 
            label={profilePage.accountUsage.locationsAnalyzed}
            usedValue={locations_analyzed}
            maxValue={maxLocations} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AccountUsageContainer 
            label={profilePage.accountUsage.areaAnalyzed}
            usedValue={total_area_analyzed}
            maxValue={maxArea} />
        </Grid>
      </Grid>
    </Fragment>
  );
}
