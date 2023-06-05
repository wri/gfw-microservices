import axios from 'axios';

export const getListFilterValues = (listID) => {
  return axios({
    url: `/locations/filters/${listID}`,
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Content-type': 'application/json',
    },
  }).then((response) => response.data);
};
