const calculateNegligibleRiskStats = (regionalInfo) => {
  let negligibleRiskTotalCoverage = 0;
  let nonNegligibleRiskTotalCoverage = 0;
  let negligibleRiskTotalAreaHA = 0;
  let nonNegligibleRiskTotalAreaHA = 0;

  regionalInfo.forEach((item) => {
    if (item.negligibleRisk) {
      negligibleRiskTotalCoverage += item.coverageHA;
      negligibleRiskTotalAreaHA += item.totalAreaHa;
    } else {
      nonNegligibleRiskTotalCoverage += item.coverageHA;
      nonNegligibleRiskTotalAreaHA += item.totalAreaHa;
    }
  });

  const negligibleRiskStats = [
    {
      id: 'negligibleRisk',
      category: 'Negligible Risk',
      coverage:
        (negligibleRiskTotalCoverage /
          (negligibleRiskTotalCoverage + nonNegligibleRiskTotalCoverage)) *
        100,
      totalAreaHA: negligibleRiskTotalAreaHA,
    },
    {
      id: 'nonNegligibleRisk',
      category: 'Non Negligible Risk',
      coverage:
        (nonNegligibleRiskTotalCoverage /
          (negligibleRiskTotalCoverage + nonNegligibleRiskTotalCoverage)) *
        100,
      totalAreaHA: nonNegligibleRiskTotalAreaHA,
    },
  ];

  return negligibleRiskStats;
};

module.exports = {
  calculateNegligibleRiskStats,
};
