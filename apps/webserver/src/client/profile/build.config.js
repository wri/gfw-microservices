/**
 * @name exports
 * @static
 * @summary Build configurations for profile page modules
 */
module.exports = {
  webpack: {
    alias: {
      profile: 'client/profile',
    },
    entry: {
      profile: 'client/profile/index.jsx',
    },
  },
};
