/**
 * @name exports
 * @static
 * @summary Build configurations for manager page modules
 */
module.exports = {
  webpack: {
    alias: {
      proManagerList: 'client/proManagerList',
    },
    entry: {
      proManagerList: 'client/proManagerList/index.js',
    },
  },
};
