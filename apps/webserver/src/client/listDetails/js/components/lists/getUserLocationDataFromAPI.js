import axios from 'axios';
import axiosRetry from 'axios-retry';
import {
  ALERTS,
  COMMODITY_RISK_VIEW,
  FOREST_CHANGE_VIEW,
  POST_2020_RISK_ASSESSMENT_VIEW,
} from './ListDetails/listViews.constants';
import { analysisTypes } from '../../../../../config/env/analysisTypes.constants';

// we avoid using axios.create() because it's not supported in the browser
const axiosClient = typeof axios.create === 'function' ? axios.create() : axios;
axiosRetry(axiosClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    error.response?.status === 429 || axiosRetry.isNetworkOrIdempotentRequestError(error),
});

const getUserLocationDataFromAPI = (
  listView,
  filters,
  selectedLists,
  searchString,
  tableSortedBy,
  tableSortedDesc,
  page = 0,
  areAllAnalysesDraft = false
) => {
  let analysisId;

  switch (listView) {
    case FOREST_CHANGE_VIEW:
    case COMMODITY_RISK_VIEW:
      analysisId = analysisTypes.FOREST_CHANGE_DIAGNOSTICS;
      break;
    case POST_2020_RISK_ASSESSMENT_VIEW:
      analysisId = analysisTypes.DEFORESTATION_KPIS;
      break;
    case ALERTS:
      analysisId = analysisTypes.ALERTS;
      break;
    default:
      analysisId = analysisTypes.FOREST_CHANGE_DIAGNOSTICS;
      break;
  }

  const data = {
    pageSize: 50,
    page: page + 1,
    areAllAnalysesDraft,
    listID: selectedLists,
    searchString,
    sortByAttribute: tableSortedBy,
    order: tableSortedDesc ? 'desc' : 'asc',
    analysisAreaMin: 0,
    analysisId,
    ...(filters.selectedCountry ? { country: filters.selectedCountry } : {}),
    ...(filters.selectedState ? { state: filters.selectedState } : {}),
    ...(filters.selectedSubState ? { subState: filters.selectedSubState } : {}),
    ...(filters.hasError ? { hasError: filters.hasError } : {}),

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

  return axiosClient({
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
