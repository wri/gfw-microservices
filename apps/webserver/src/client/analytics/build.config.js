/**
 * @name exports
 * @static
 * @summary Build configurations for analytics page modules
 */
module.exports = {
  webpack: {
    alias: {
      analytics: 'client/analytics',
    },
    entry: {
      analytics: 'client/analytics/index.js',
    },
  },
};
