module.exports = (analysisData, listStatus) => {
  const analysisTypes = {};

  for (const item of analysisData) {
    if (item.Status === listStatus) {
      analysisTypes[item.AnalysisID] = true;
    }
  }

  return analysisTypes;
};
