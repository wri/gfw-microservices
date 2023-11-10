const path = require('path');
import { analysisTypesOptions } from '@wri-monorepos/constants';

module.exports = (analysisData) => {
  const extractAnalysisTypes = analysisTypesOptions.reduce((result, analysisTypesOption) => {
    const listAnalysisInfo = analysisData.find(
      (item) => item.analysisId === analysisTypesOption.id
    );
    result[analysisTypesOption.id] = Boolean(listAnalysisInfo);
    return result;
  }, {});

  return extractAnalysisTypes;
};
