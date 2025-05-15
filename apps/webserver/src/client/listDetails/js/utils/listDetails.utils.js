import { analysisTypes } from '../../../../config/env/analysisTypes.constants';

export const getActiveAnalysisFlags = (listAnalysesStatus = []) => {
  const analysisIds = listAnalysesStatus?.map(({ analysisId }) => analysisId) || [];

  const isFcdActive = analysisIds.includes(analysisTypes.FOREST_CHANGE_DIAGNOSTICS);
  const isPalmRiskActive = analysisIds.includes(analysisTypes.PALM_RISK);
  const isAfiActive = analysisIds.includes(analysisTypes.DEFORESTATION_KPIS);
  const isGHGActive = analysisIds.includes(analysisTypes.GREENHOUSE_GAS_EMISSIONS);

  const isOnlyGHGActive =
    analysisIds.length === 1 && analysisIds[0] === analysisTypes.GREENHOUSE_GAS_EMISSIONS;

  return {
    isFcdActive,
    isPalmRiskActive,
    isAfiActive,
    isGHGActive,
    isOnlyGHGActive,
  };
};
