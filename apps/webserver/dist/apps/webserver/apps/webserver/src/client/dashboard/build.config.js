/**
 * @name exports
 * @static
 * @summary Build configurations for dashboard page modules
 */
module.exports = {
  webpack: {
    alias: {
      dashboard: 'client/dashboard',
    },
    entry: {
      dashboard: 'client/dashboard/index.js',
    },
    build: {
      criticalStyle: 'common/css/header.scss',
      prerender: {
        'login-component': 'common/js/components/Header.js',
      },
    },
  },
};
