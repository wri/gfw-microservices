import { Fragment } from 'react';
import { Grid } from '@mui/material';
import { profilePage } from '../../../../common/js/config';
import featureFlags from '../../../../../utils/general.utils';
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
  const { isTokenizationAvailable } = featureFlags;

  const locationsLabel = isTokenizationAvailable
    ? profilePage.accountUsage.tokens
    : profilePage.accountUsage.locationsAnalyzed;

  const InfoBubbleLocationsAnalyzed = () => {
    if (isTokenizationAvailable) {
      return (
        <>
          <h3 class="bubble-title">Tokens</h3>
          <p>
            Enterprises receive a free annual allotment of Usage Tokens and may purchase additional
            quantities. Free quantities are consumed before paid quantities. Any remaining free
            quantities expire as new quantities are granted at account renewal.
          </p>
          <h4>How consumption of Tokens is calculated</h4>
          <p>
            When a list is analyzed or updated, GFW Pro multiplies the number of locations within
            that list by the Token Fee for each distinct analysis type applied to that list and sums
            these values to calculate tokens required. There is an additional flat Token Fee charged
            per analysis type when a list is analyzed or updated.
          </p>
          <p>
            Read more about account usage{' '}
            <a target="_blank" href="/about?section=Fees">
              here
            </a>
            .
          </p>
        </>
      );
    }

    return (
      <>
        <h3 class="bubble-title">Locations Analyzed</h3>
        <p>
          Enterprises receive a free annual allotment of analyses and may purchase additional
          quantities. Free quantities are consumed before paid quantities. Any remaining free
          quantities expire as new quantities are granted at account renewal.
        </p>
        <h4>How # of Analyses is calculated</h4>
        <p>
          Each time a list is updated, GFW Pro multiplies the number of analysis types (e.g., Forest
          Change, Deforestation Reporting) by the number of locations within that list. These
          quantities are tracked cumulatively during the account year.
        </p>
      </>
    );
  };

  const InfoBubbleAreaAnalyzed = () => {
    return (
      <>
        <h3 class="bubble-title">Hectares Analyzed</h3>
        <p>
          Enterprises receive a free annual allotment of hectares and may purchase additional
          quantities. Free quantities are consumed before paid quantities. Any remaining free
          quantities expire as new quantities are granted at account renewal.
        </p>
        <h4>How Area Analyzed is calculated</h4>
        <p>
          Each time a list is updated, GFW Pro multiplies the number of analysis types (e.g., Forest
          Change, Deforestation Reporting) by the sum of the extent in hectares for locations within
          that list. These quantities are tracked cumulatively during the account year.
        </p>
      </>
    );
  };

  return (
    <Fragment>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <AccountUsageContainer
            label={locationsLabel}
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
