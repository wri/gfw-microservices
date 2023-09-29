import featureFlags from './general.utils';
import { analysisTypes } from '../config/env/analysisTypes.constants';

const getAnalysesSelectedByDefault = () => {
  return featureFlags.isAfiAvailable
    ? [analysisTypes.FOREST_CHANGE_DIAGNOSTICS]
    : [analysisTypes.FOREST_CHANGE_DIAGNOSTICS, analysisTypes.ALERTS];
};

export default getAnalysesSelectedByDefault;
