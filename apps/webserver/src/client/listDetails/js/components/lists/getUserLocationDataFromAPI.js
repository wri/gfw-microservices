import axios from 'axios';
import store from '../../../../locations/js/store';
import {
  COMMODITY_RISK_VIEW,
  FOREST_CHANGE_VIEW,
  POST_2000_RISK_ASSESSMENT_VIEW,
} from './ListDetails/listViews.constants';

const getUserLocationDataFromAPI = (
  filters,
  selectedLists,
  searchString,
  tableSortedBy,
  tableSortedDesc,
  page = 0
) => {
  const { listView } = store.getState();

  let analysisId;

  switch (listView) {
    case FOREST_CHANGE_VIEW:
      analysisId = 'FCD';

      break;
    case COMMODITY_RISK_VIEW:
      analysisId = 'FCD';

      break;
    case POST_2000_RISK_ASSESSMENT_VIEW:
      analysisId = 'AFI';

      break;
    default:
      analysisId = 'FCD';

      break;
  }

  console.log({ listView });
  const data = {
    pageSize: 50,
    page: page + 1,
    listID: selectedLists,
    searchString,
    sortByAttribute: listView === POST_2000_RISK_ASSESSMENT_VIEW ? 'landmarkHA' : tableSortedBy,
    order: tableSortedDesc ? 'desc' : 'asc',
    analysisAreaMin: filters.selectedAreaMin || 0,
    analysisId,
    ...(filters.selectedAreaMax ? { analysisAreaMax: filters.selectedAreaMax } : {}),
    ...(filters.selectedCountry ? { country: filters.selectedCountry } : {}),
    ...(filters.selectedState ? { state: filters.selectedState } : {}),
    ...(filters.selectedSubState ? { subState: filters.selectedSubState } : {}),

    // commodity risk filters:
    ...(filters.selectedSupplier ? { selectedSupplier: filters.selectedSupplier } : {}),
    ...(filters.selectedSecondSupplier
      ? { selectedSecondSupplier: filters.selectedSecondSupplier }
      : {}),
    ...(filters.selectedParentCompany
      ? { selectedParentCompany: filters.selectedParentCompany }
      : {}),
    ...(filters.showRSPOCertified ? { showRSPOCertified: filters.showRSPOCertified } : {}),
    ...(filters.selectedOverallThreats?.length
      ? { selectedOverallThreats: filters.selectedOverallThreats }
      : {}),
    ...(filters.selectedOverallValues?.length
      ? { selectedOverallValues: filters.selectedOverallValues }
      : {}),
    ...(filters.selectedMillPriority?.length
      ? { selectedMillPriority: filters.selectedMillPriority }
      : {}),
  };

  return axios({
    url: '/locations/getListsPaginated',
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Content-type': 'application/json',
    },
    params: data,
  }).then((response) => response.data);
};

export default getUserLocationDataFromAPI;
