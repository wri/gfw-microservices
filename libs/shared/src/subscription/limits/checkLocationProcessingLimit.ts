import {
  getAccountAnalysisUsageByAnalysisType,
  getChargeRates,
  getListLocationsCountById,
  findApplicableRate,
} from '@wri-monorepos/sql';
import { getAccountSubscriptionData } from '../utils';
import { calculateAccountSubscriptionDates } from '../utils/accountSubscriptionDates';

export interface CheckAccountListLocationProcessingLimit {
  listId: number;
  orgDbName: string;
  organizationId: number;
  subscriptionStatusId: number;
  analysisTypesToProcess?: Record<string, boolean>;
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function checkLocationProcessingLimit({
  listId,
  orgDbName,
  organizationId,
  subscriptionStatusId,
  analysisTypesToProcess = {},
}: CheckAccountListLocationProcessingLimit) {
  // Get enabled analysis types (where value is true)
  const enabledAnalysisTypes = Object.entries(analysisTypesToProcess)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type);

  const { accountUsage, accountLimits, organizationRenewalTime } = await getAccountSubscriptionData(
    {
      organizationId,
      subscriptionStatusId,
    }
  );

  const listLocationsCount = await getListLocationsCountById(listId, orgDbName);
  const locationsAnalyzed = toNumber(accountUsage.locations_analyzed);
  const maxLocationsPerYear = toNumber(accountLimits.max_locations_per_year);

  if (locationsAnalyzed + listLocationsCount > maxLocationsPerYear) {
    return true;
  }

  const tokensPerYearLimit = toNumber(accountLimits.tokens_per_year);

  if (tokensPerYearLimit <= 0) {
    return true;
  }

  const { startDate, endDate } = calculateAccountSubscriptionDates(organizationRenewalTime);
  const usageByType = await getAccountAnalysisUsageByAnalysisType({
    startDate,
    endDate,
    orgDbName,
  });

  const totalTokensUsed = usageByType.reduce((sum, usage) => sum + toNumber(usage.total_tokens), 0);

  if (enabledAnalysisTypes.length === 0) {
    return totalTokensUsed > tokensPerYearLimit;
  }

  const chargeRates = await getChargeRates();
  const now = new Date();

  const tokensRequiredForList = enabledAnalysisTypes.reduce((sum, analysisType) => {
    const rate = findApplicableRate(chargeRates, analysisType, now);

    if (!rate) {
      return sum;
    }

    const locationRate = toNumber(rate.locationRate);
    const listRate = toNumber(rate.listRate);

    return sum + listLocationsCount * locationRate + listRate;
  }, 0);

  return totalTokensUsed + tokensRequiredForList > tokensPerYearLimit;
}
