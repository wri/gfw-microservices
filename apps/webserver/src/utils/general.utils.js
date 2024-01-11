


const featureFlags = () => {
  const value =  localStorage.getItem('featureFlags')

  if (value !== null && value !== undefined && value !== '' && value !== 'undefined') {
    return JSON.parse(value);
  }

  return {};
}

export default featureFlags;
