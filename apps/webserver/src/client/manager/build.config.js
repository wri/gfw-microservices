/**
 * @name exports
 * @static
 * @summary Build configurations for manager page modules
 */
module.exports = {
  webpack: {
    alias: {
      manager: 'client/manager',
    },
    entry: {
      manager: 'client/manager/index.js',
    },
  },
};
