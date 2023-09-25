import axios from 'axios';

const getFeatureFlags = async () => {
  return await axios({
    url: '/api/feature-flags',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  })
    .then(({ data }) => {
      sessionStorage.setItem('featureFlags', JSON.stringify(data));
      return data;
    })
    .catch((err) => {
      console.warn(err);
    });
};

export default getFeatureFlags;
