import { getActiveAnalysisFlags } from '../../../listDetails/js/utils/listDetails.utils';

const getAvailableDiagnostics = (selectedList) => {
  let availableDiagnostics = [];

  const { isFcdActive, isPalmRiskActive } = getActiveAnalysisFlags(
    selectedList?.listAnalysesStatus
  );

  if (isFcdActive) {
    availableDiagnostics.push({ value: 'forest_change', label: 'Forest change' });
  }
  if (isPalmRiskActive) {
    availableDiagnostics.push({
      value: 'commodity_risk',
      label: 'Palm Risk Assessment',
    });
  }
  return availableDiagnostics;
};

export default getAvailableDiagnostics;
