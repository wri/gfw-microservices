module.exports = (analysisData, listStatus) => {
  const analysisTypes = analysisData
    .filter((item) => item.Status === listStatus)
    .reduce((result, item) => {
      result[item.AnalysisID] = true;
      return result;
    }, {});

  return analysisTypes;
};