const featureFlags = {
  isEudrAvailable: process.env.NODE_ENV === 'development',
};

export default featureFlags;
