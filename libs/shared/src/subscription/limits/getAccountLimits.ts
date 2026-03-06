import {
  AnalysisLimit,
  getAccountAnalysisLimits,
  getAccountAnalysisLimitsPerYear,
  getAccountRenewalTime,
} from '@wri-monorepos/sql';
import { combineOrganizationLimits, resolvePerYearLimits } from '../utils';
import { getAccountRolloverLimits } from './getAccountRolloverLimits';

export async function getAccountSubscriptionLimits(organizationType: number, renewalDate: Date) {
  const rawLimits = await getAccountAnalysisLimitsPerYear(organizationType);
  const perYearLimits = resolvePerYearLimits(rawLimits, renewalDate);
  return perYearLimits.map(transformData);
}

export async function getAccountExtraLimits(organizationId: number) {
  const analysisLimit = await getAccountAnalysisLimits({ organizationId });
  return transformData(analysisLimit);
}

export async function getAccountLimits(organizationId: number, organizationType: number) {
  const orgRenewalTime = await getAccountRenewalTime(organizationId);
  const renewalDate = new Date(orgRenewalTime);

  const organizationExtraLimits = await getAccountExtraLimits(organizationId);
  const organizationSubscriptionLimits = await getAccountSubscriptionLimits(
    organizationType,
    renewalDate
  );

  // Use the latest year's limits as the current subscription limits
  const currentSubscriptionLimits = getLatestLimits(organizationSubscriptionLimits);

  const organizationRolloverLimits = await getAccountRolloverLimits(
    organizationId,
    currentSubscriptionLimits,
    organizationExtraLimits,
    renewalDate
  );

  return combineOrganizationLimits(currentSubscriptionLimits, organizationRolloverLimits);
}

export function getLatestLimits(limits: AnalysisLimit[]): AnalysisLimit {
  if (limits.length === 0) {
    return {
      MaxAreaAnalyzeablePerYear: 0,
      MaxAreaPerList: 0,
      max_locations_per_year: 0,
      tokens_per_year: 0,
    };
  }

  const latest = limits[limits.length - 1];
  return {
    MaxAreaAnalyzeablePerYear: latest.MaxAreaAnalyzeablePerYear,
    MaxAreaPerList: latest.MaxAreaPerList,
    OrgType: latest.OrgType,
    max_locations_per_year: latest.max_locations_per_year,
    tokens_per_year: latest.tokens_per_year,
  };
}

function transformData(analysisLimit: AnalysisLimit) {
  return {
    ...analysisLimit,
    max_locations_per_year: Number(analysisLimit.max_locations_per_year),
    tokens_per_year:
      analysisLimit.tokens_per_year != null ? Number(analysisLimit.tokens_per_year) : undefined,
  };
}
