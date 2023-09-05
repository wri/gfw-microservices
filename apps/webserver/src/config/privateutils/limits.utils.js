const calculateProcessingLimit = (accountLimits, accountUsage) => {
  const availableAnalyzableAreaRemaining =
    accountLimits.MaxAreaAnalyzeablePerYear - accountUsage.total_area_analyzed;

  return Math.min(availableAnalyzableAreaRemaining, accountLimits.MaxAreaPerList);
};

module.exports = {
  calculateProcessingLimit,
};
