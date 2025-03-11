/**
 * @name exports
 * @static
 * @summary Build configurations for verify page modules
 */
module.exports = {
  webpack: {
    alias: {
      more: 'client/more',
    },
    entry: {
      more: 'client/more/index.js',
    },
    build: {
      criticalStyle: 'common/css/header.scss',
      prerender: {
        'login-component': 'common/js/components/Header.js',
      },
    },
  },
};
