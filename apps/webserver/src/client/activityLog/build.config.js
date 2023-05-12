/**
 * @name exports
 * @static
 * @summary Build configurations for activity log page modules
 */
module.exports = {
  webpack: {
    alias: {
      activityLog: 'client/activityLog',
    },
    entry: {
      activityLog: 'client/activityLog/index.jsx',
    },
  },
};
