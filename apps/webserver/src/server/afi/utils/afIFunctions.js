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

const determineNegligibleRiskForLocation = (negligibleRiskValue) => {
  if (negligibleRiskValue > 99.5) {
    return true;
  } else if (negligibleRiskValue < 0.5) {
    return false;
  }
  return null;
};

const afiAnalysisFilters = (record) => {
  // filter positive locations until confirmation that location_id with negative values are valid
  if (record.location_id < 1) {
    return false;
  }
  // only locations with valid gadm_id should report
  if (!record.gadm_id) {
    return false;
  }
  return true;
};

module.exports = {
  calculateNegligibleRiskStats,
  determineNegligibleRiskForLocation,
  afiAnalysisFilters,
};
