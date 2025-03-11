/**
 * @name exports
 * @static
 * @summary Build configurations for changeExist page modules
 */
module.exports = {
  webpack: {
    alias: {
      changeExist: 'client/changeExist',
    },
    entry: {
      changeExist: 'client/changeExist/index.js',
    },
  },
};
