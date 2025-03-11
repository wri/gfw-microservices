/**
 * @name exports
 * @static
 * @summary Build configurations for change page modules
 */
module.exports = {
  webpack: {
    alias: {
      change: 'client/change',
    },
    entry: {
      change: 'client/change/index.js',
    },
  },
};
