/**
 * @name exports
 * @static
 * @summary Build configurations for listDetails page modules
 */
module.exports = {
  webpack: {
    alias: {
      listDetails: 'client/listDetails',
    },
    entry: {
      listDetails: 'client/listDetails/index.js',
    },
  },
};
