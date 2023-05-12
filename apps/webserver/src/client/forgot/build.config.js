/**
 * @name exports
 * @static
 * @summary Build configurations for forgot page modules
 */
module.exports = {
  webpack: {
    alias: {
      forgot: 'client/forgot',
    },
    entry: {
      forgot: 'client/forgot/index.js',
    },
  },
};
