import axios from 'axios';

export const deleteAllFilteredLocations = (listID, filters, listFilterStr) => {
  console.log(filters);
  console.log(listFilterStr);
  console.log('delete all locations or filtered locations in large lists');

  const params = {
    listID,
    searchString: listFilterStr,
    ...(filters.selectedCountry ? { country: filters.selectedCountry } : {}),
    ...(filters.selectedState ? { state: filters.selectedState } : {}),
    ...(filters.selectedSubState ? { subState: filters.selectedSubState } : {}),
    ...(filters.selectedAreaMin ? { selectedAreaMin: filters.selectedAreaMin } : {}),
    ...(filters.selectedAreaMax ? { selectedAreaMax: filters.selectedAreaMax } : {}),
  };

  return axios({
    url: '/locations/deleteAllFilteredLocations',
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Content-type': 'application/json',
    },
    params,
  }).then((response) => response.data);
};
