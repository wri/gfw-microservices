import { analysisTypes } from '../config/env/analysisTypes.constants';
import { listStatus } from '../config/env/listStatuses.constants';

const getActiveAnalysisType = (listAnalysesStatus = []) => {
  const { FOREST_CHANGE_DIAGNOSTICS, DEFORESTATION_KPIS } = analysisTypes;
  const listAnalysesStatusIds = listAnalysesStatus
    .filter((analysis) => analysis.status === listStatus.Active)
    .map(({ analysisId }) => analysisId);

  const isForestChangeDiagnosticActive = listAnalysesStatusIds.includes(FOREST_CHANGE_DIAGNOSTICS);
  const isAfiActive = listAnalysesStatusIds.includes(DEFORESTATION_KPIS);
  return isForestChangeDiagnosticActive
    ? FOREST_CHANGE_DIAGNOSTICS
    : isAfiActive
    ? DEFORESTATION_KPIS
    : '';
};

export default getActiveAnalysisType;
