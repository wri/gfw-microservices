const getFeatureFlags = async () => {
  try {
    const response = await fetch('/api/feature-flags', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    });
    const { data } = await response.json();
    localStorage.setItem('featureFlags', JSON.stringify(data));
  } catch (error) {
    console.warn(error);
  }
};

export default getFeatureFlags;
