const featureFlags = {
  isEudrAvailable: process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging',
};

export default featureFlags;
