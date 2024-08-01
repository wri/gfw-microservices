/**
 * @name exports
 * @static
 * @summary Build configurations for map page modules
 */
module.exports = {
  webpack: {
    alias: {
      map: 'client/map',
    },
    entry: {
      map: 'client/map/index.jsx',
    },
  },
};
