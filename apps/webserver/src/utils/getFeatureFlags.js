const getFeatureFlags = async () => {
  return await fetch('/feature-flags', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((response) => {
      sessionStorage.setItem('featureFlags', JSON.stringify(response));
      return response;
    });
};

export default getFeatureFlags;
