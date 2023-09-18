const formatNegligibleRiskStatForChart = (data) => {
  const { negligibleRisk, totalAreaHa } = data;

  // Calculate the non-negligible risk coverage
  const nonNegligibleRiskCoverage = 100 - negligibleRisk;

  // Create and return the formatted object
  const result = [
    {
      id: 'negligibleRisk',
      category: 'Negligible Risk',
      coverage: negligibleRisk,
      totalAreaHA: (totalAreaHa * negligibleRisk) / 100,
    },
    {
      id: 'nonNegligibleRisk',
      category: 'Non Negligible Risk',
      coverage: nonNegligibleRiskCoverage,
      totalAreaHA: (totalAreaHa * nonNegligibleRiskCoverage) / 100,
    },
  ];

  return result;
};

module.exports = {
  formatNegligibleRiskStatForChart,
};
