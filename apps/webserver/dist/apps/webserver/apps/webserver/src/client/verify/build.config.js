/**
 * @name exports
 * @static
 * @summary Build configurations for verify page modules
 */
module.exports = {
  webpack: {
    alias: {
      verify: 'client/verify',
    },
    entry: {
      verify: 'client/verify/index.js',
    },
  },
};
