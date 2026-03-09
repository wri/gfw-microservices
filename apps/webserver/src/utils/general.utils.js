import getFeatureFlags from './getFeatureFlags';

// Refresh feature flags from server on each page load
getFeatureFlags();

const featureFlags = new Proxy(
  {},
  {
    get(_, prop) {
      try {
        const flags = JSON.parse(localStorage.getItem('featureFlags')) || {};
        return flags[prop];
      } catch (e) {
        return undefined;
      }
    },
  }
);

export default featureFlags;
