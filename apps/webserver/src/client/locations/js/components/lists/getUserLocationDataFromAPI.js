import axios from 'axios';

const getUserLocationDataFromAPI = (filters, selectedLists, searchString, tableSortedBy, tableSortedDesc, page = 0) => {
  const data = {
    pageSize: 50,
    page: page + 1,
    listID: selectedLists,
    searchString,
    sortByAttribute: tableSortedBy,
    order: tableSortedDesc ? 'desc' : 'asc',
    analysisAreaMin: filters.selectedAreaMin || 0,
    ...(filters.selectedAreaMax ? { analysisAreaMax: filters.selectedAreaMax } : {}),
    ...(filters.selectedCountry ? { country: filters.selectedCountry } : {}),
    ...(filters.selectedState ? { state: filters.selectedState } : {}),
    ...(filters.selectedSubState ? { subState: filters.selectedSubState } : {}),

    // commodity risk filters:
    ...(filters.selectedSupplier ? { selectedSupplier: filters.selectedSupplier } : {}),
    ...(filters.selectedSecondSupplier ? { selectedSecondSupplier: filters.selectedSecondSupplier } : {}),
    ...(filters.selectedParentCompany ? { selectedParentCompany: filters.selectedParentCompany } : {}),
    ...(filters.showRSPOCertified ? { showRSPOCertified: filters.showRSPOCertified } : {}),
    ...(filters.selectedOverallThreats?.length ? { selectedOverallThreats: filters.selectedOverallThreats } : {}),
    ...(filters.selectedOverallValues?.length ? { selectedOverallValues: filters.selectedOverallValues } : {}),
    ...(filters.selectedMillPriority?.length ? { selectedMillPriority: filters.selectedMillPriority } : {}),
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
