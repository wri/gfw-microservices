const path = require('path');
const { analysisTypesOptions } = require(path.resolve('./config/env/analysisTypes.constants'));

module.exports = (analysisData, listStatus) => {
  const extractAnalysisTypes = analysisTypesOptions.reduce((result, analysisTypesOption) => {
    const listAnalysisInfo = analysisData.find(
      (item) => item.analysisId === analysisTypesOption.id
    );
    result[analysisTypesOption.id] = Boolean(
      listAnalysisInfo && listAnalysisInfo.status === listStatus
    );
    return result;
  }, {});

  return extractAnalysisTypes;
};
