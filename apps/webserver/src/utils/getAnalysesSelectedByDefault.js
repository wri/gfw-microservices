import { analysisTypes } from '../config/env/analysisTypes.constants';

const getAnalysesSelectedByDefault = () => {
  return [analysisTypes.FOREST_CHANGE_DIAGNOSTICS];
};

export default getAnalysesSelectedByDefault;
