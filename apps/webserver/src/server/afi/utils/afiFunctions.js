const formatNegligibleRiskStatForChart = (data) => {
  const { negligibleRisk = 0, totalAreaHa = 0 } = data || {};

  // Calculate the non-negligible risk coverage
  const nonNegligibleRiskCoverage = 100 - negligibleRisk;

  // Create and return the formatted object
  const result = [
    {
      id: 'negligibleRisk',
      category: 'Negligible Risk',
      coverage: negligibleRisk,
      totalAreaHA: totalAreaCalculation(totalAreaHa, negligibleRisk),
    },
    {
      id: 'nonNegligibleRisk',
      category: 'Non Negligible Risk',
      coverage: nonNegligibleRiskCoverage,
      totalAreaHA: totalAreaCalculation(totalAreaHa, nonNegligibleRiskCoverage),
    },
  ];
  return result;
};

const totalAreaCalculation = (totalAreaHa, coverage) => {
  const result = (totalAreaHa * coverage) / 100;
  return isNaN(result) ? 0 : result;
};

module.exports = {
  formatNegligibleRiskStatForChart,
};
