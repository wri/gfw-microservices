/**
 * @name exports
 * @static
 * @summary Build configurations for reset page modules
 */
module.exports = {
  webpack: {
    alias: {
      reset: 'client/reset',
    },
    entry: {
      reset: 'client/reset/index.js',
    },
  },
};
