import axios from 'axios';
import store from '../../../../locations/js/store';
import {
  COMMODITY_RISK_VIEW,
  FOREST_CHANGE_VIEW,
  POST_2020_RISK_ASSESSMENT_VIEW,
} from './ListDetails/listViews.constants';
import { analysisTypes } from '../../../../../config/env/analysisTypes.constants';

/**
 * Retry utility for handling 429 errors
 */
const retryOn429 = async (axiosCall, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await axiosCall();
    } catch (error) {
      // Check if it's a 429 error and we haven't exceeded max retries
      if (error.response?.status === 429 && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(`Rate limited (429) on attempt ${attempt}. Retrying in ${Math.round(delay / 1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // If it's not a 429 error or we've exceeded retries, throw the error
      throw error;
    }
  }
};

const getUserLocationDataFromAPI = (
  filters,
  selectedLists,
  searchString,
  tableSortedBy,
  tableSortedDesc,
  page = 0,
  areAllAnalysesDraft = false
) => {
  const { listView } = store.getState();

  let analysisId;

  switch (listView) {
    case FOREST_CHANGE_VIEW:
    case COMMODITY_RISK_VIEW:
      analysisId = analysisTypes.FOREST_CHANGE_DIAGNOSTICS;
      break;
    case POST_2020_RISK_ASSESSMENT_VIEW:
      analysisId = analysisTypes.DEFORESTATION_KPIS;
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
    analysisAreaMin: filters.selectedAreaMin || 0,
    analysisId,
    ...(filters.selectedAreaMax ? { analysisAreaMax: filters.selectedAreaMax } : {}),
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

  // Use retry logic for 429 errors
  return retryOn429(() =>
    axios({
      url: '/locations/getListsPaginated',
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
      params: data,
    })
  ).then((response) => response.data);
};

export default getUserLocationDataFromAPI;
