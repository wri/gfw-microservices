const isValidJSON = () => {
  try {
    JSON.parse(localStorage.getItem('featureFlags'));
  } catch (e) {
    return false;
  }
  return true;
};

const featureFlags = isValidJSON() ? JSON.parse(localStorage.getItem('featureFlags')) : '{}';

export default featureFlags;
