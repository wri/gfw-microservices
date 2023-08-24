const featureFlags = {
  isEudrAvailable: process.env.NODE_ENV !== 'production',
};

export default featureFlags;
