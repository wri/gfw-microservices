/**
 * @seen also {@path libs/geo/src/utils/account.utils.ts}
 * */
const calculateProcessingLimit = (accountLimits, accountUsage) => {
  const availableAnalyzableAreaRemaining =
    accountLimits.MaxAreaAnalyzeablePerYear - accountUsage.total_area_analyzed;

  return Math.min(availableAnalyzableAreaRemaining, accountLimits.MaxAreaPerList);
};

const calculateAccountUsagePercentage = (accountUsage, accountLimit) => {
  if (accountUsage === 0 || accountLimit === 0) {
    return 0; // Avoid division by zero
  }

  const usagePercentage = (accountUsage / accountLimit) * 100;

  return Math.min(100, usagePercentage); // Ensure the percentage does not exceed 100%
};

module.exports = {
  calculateProcessingLimit,
  calculateAccountUsagePercentage,
};
