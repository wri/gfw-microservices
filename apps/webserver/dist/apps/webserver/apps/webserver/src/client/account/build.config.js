/**
 * @name exports
 * @static
 * @summary Build configurations for account page modules
 */
module.exports = {
  webpack: {
    alias: {
      account: 'client/account',
    },
    entry: {
      account: 'client/account/index.js',
    },
  },
};
