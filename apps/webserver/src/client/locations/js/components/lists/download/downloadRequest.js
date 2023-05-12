import axios from 'axios';

const downloadRequest = ({
  listID,
  format,
  type,
  filters = {},
  listFilterStr = '',
  tableSortedBy,
  tableSortedDesc,
  aggregate,
  listView,
  combinedColumns,
  selectedLocations,
  allLocationsSelected,
}) => {
  // 'Location Name' is named 'Investment Name' in the backend
  // adding quotation marks (stringify) to the column name as some of the field names in the database contain spaces
  const sortByAttribute = tableSortedBy === 'Location Name' ? 'Investment Name' : JSON.stringify(tableSortedBy);

  const data = {
    type,
    sortByAttribute,
    order: tableSortedDesc ? 'desc' : 'asc',
    listFilterStr,
    aggregate: aggregate ?? true,
    listView,
    analysisAreaMin: filters.selectedAreaMin || 0,
    ...(filters.selectedAreaMax ? { analysisAreaMax: filters.selectedAreaMax } : {}),
    ...(filters.selectedCountry ? { country: filters.selectedCountry } : {}),
    ...(filters.selectedState ? { state: filters.selectedState } : {}),
    ...(filters.selectedSubState ? { subState: filters.selectedSubState } : {}),
    combinedColumns: combinedColumns?.join(','),
    selectedLocations: allLocationsSelected ? 'all' : selectedLocations?.join(','),
  };

  return axios({
    url: `/locations/${format}/${listID}`,
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Content-type': 'application/json',
    },
    params: data,
  }).then((response) => response.data);
};

export default downloadRequest;
