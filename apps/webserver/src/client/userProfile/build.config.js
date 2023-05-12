/**
 * @name exports
 * @static
 * @summary Build configurations for UserProfile page modules
 */
module.exports = {
  webpack: {
    alias: {
      userProfile: 'client/userProfile',
    },
    entry: {
      userProfile: 'client/userProfile/index.jsx',
    },
  },
};
