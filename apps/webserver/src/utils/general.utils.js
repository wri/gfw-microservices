const getFeatureFlag = () => {
  try {
    return JSON.parse(localStorage.getItem('featureFlags')) || {};
  } catch (e) {
    return {};
  }
};

const featureFlags = getFeatureFlag();

export default featureFlags;
