import React, { Fragment } from 'react';
import Grid from '@mui/material/Grid';
import { profilePage } from '../../../../common/js/config';
import AccountUsageContainer from './AccountUsageContent';

/**
 * @summary Displays account usage data
 * @param {Object} props
 * @returns ReactNode
 */
export default function AccountUsage({
  total_area_analyzed,
  locations_analyzed,
  maxLocations,
  maxArea,
}) {

  const InfoBubbleLocationsAnalyzed = () => {
    return (
      <>
        <h3 class="bubble-title"># of Analyses</h3>
        <p>
          Enterprises receive a free annual allotment of analyses and may purchase additional quantities. 
          Free quantities are consumed before paid quantities. Any remaining free quantities expire as new
          quantities are granted at account renewal.​
        </p>
        <h4>How # of Analyses is calculated</h4>
        <p>
          Each time a list is updated, GFW Pro multiplies the number of analysis types (e.g., Forest Change, 
          Deforestation Reporting) by the number of locations within that list. These quantities are tracked 
          cumulatively during the account year.​
        </p>
      </>
    );
  }

  const InfoBubbleAreaAnalyzed = () => {
    return (
      <>
        <h3 class="bubble-title"># of Analyses</h3>
        <p>
        Enterprises receive a free annual allotment of hectares and may purchase additional quantities. 
        Free quantities are consumed before paid quantities. Any remaining free quantities expire as new 
        quantities are granted at account renewal.​
        </p>
        <h4>How Area Analyzed is calculated</h4>
        <p>
          Each time a list is updated, GFW Pro multiplies the number of analysis types (e.g., Forest Change, 
          Deforestation Reporting) by the sum of the extent in hectares for locations within that list. 
          These quantities are tracked cumulatively during the account year.​
        </p>
      </>
    );
  }

  return (
    <Fragment>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <AccountUsageContainer
            label={profilePage.accountUsage.locationsAnalyzed}
            usedValue={locations_analyzed}
            maxValue={maxLocations}
            InfoBubbleContent={InfoBubbleLocationsAnalyzed}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AccountUsageContainer
            label={profilePage.accountUsage.areaAnalyzed}
            usedValue={total_area_analyzed}
            maxValue={maxArea}
            InfoBubbleContent={InfoBubbleAreaAnalyzed}
          />
        </Grid>
      </Grid>
    </Fragment>
  );
}
