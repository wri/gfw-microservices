/**
 * @name exports
 * @static
 * @summary Build configurations for locations page modules
 */
module.exports = {
  webpack: {
    alias: {
      locations: 'client/locations',
    },
    entry: {
      locations: 'client/locations/index.js',
    },
  },
};
