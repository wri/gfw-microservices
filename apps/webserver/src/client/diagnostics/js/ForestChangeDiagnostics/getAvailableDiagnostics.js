import { checkValidViewCommodity } from '../../../locations/js/utils/lists.utils';

const getAvailableDiagnostics = (listData, selectedLists) => {
  let availableDiagnostics = [];
  const forestChangeDisabled = listData.length === 0;
  if (!forestChangeDisabled) {
    availableDiagnostics.push({ value: 'forest_change', label: 'Forest change' });
  }
  const commodityRiskDisabled = !checkValidViewCommodity(selectedLists?.[0], listData?.[0]);
  if (!commodityRiskDisabled) {
    availableDiagnostics.push({
      value: 'commodity_risk',
      label: 'Palm Risk Assessment',
    });
  }
  return availableDiagnostics;
};

export default getAvailableDiagnostics;
