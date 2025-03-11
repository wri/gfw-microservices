import axios from 'axios';

function editLocationsFromCsv(list_id, attributes, activeTemplate) {
  return axios({
    url: '/locations/editLocations',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    data: {
      list_id,
      attributes,
      activeTemplate,
    },
  });
}

export default editLocationsFromCsv;
