module.exports = (analysisData, listStatus) => {
  const analysisTypes = analysisData
    .filter((item) => item.status === listStatus)
    .reduce((result, item) => {
      result[item.analysisId] = true;
      return result;
    }, {});

  return analysisTypes;
};
