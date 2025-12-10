import { analysisTypes } from '../../../../config/env/analysisTypes.constants';
import { GFW_LISTS_NUMBER_CONSTANTS } from '../../../../config/env/gfwLists.constants';

export const getActiveAnalysisFlags = ({
  listAnalysesStatus = [],
  id,
  isGlobalForestWatchList,
}) => {
  const analysisIds = listAnalysesStatus.map(({ analysisId }) => analysisId);

  const fcd = listAnalysesStatus.find(
    ({ analysisId }) => analysisId === analysisTypes.FOREST_CHANGE_DIAGNOSTICS
  );

  const isGfwPalmOilMillsList =
    isGlobalForestWatchList && id === GFW_LISTS_NUMBER_CONSTANTS.PALM_OIL_MILLS;

  const isFcdActive = !!fcd || isGfwPalmOilMillsList;
  const isPalmRiskActive =
    analysisIds.includes(analysisTypes.PALM_RISK) ||
    isGfwPalmOilMillsList ||
    fcd?.options === 'PalmRisk';

  const isAfiActive = analysisIds.includes(analysisTypes.DEFORESTATION_KPIS);
  const isGHGActive = analysisIds.includes(analysisTypes.GREENHOUSE_GAS_EMISSIONS);

  const isOnlyGHGActive =
    analysisIds.length === 1 && analysisIds[0] === analysisTypes.GREENHOUSE_GAS_EMISSIONS;

  const isAlertsActive = analysisIds.includes(analysisTypes.ALERTS);

  return {
    isFcdActive,
    isPalmRiskActive,
    isAfiActive,
    isGHGActive,
    isOnlyGHGActive,
    isAlertsActive,
  };
};
