import axios from 'axios';

const getFeatureFlags = async () => {
  return await axios({
    url: '/api/feature-flags',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((response) => {
      sessionStorage.setItem('featureFlags', JSON.stringify(response));
      return response;
    })
    .catch((err) => {
      console.warn(err);
    });
};

export default getFeatureFlags;
