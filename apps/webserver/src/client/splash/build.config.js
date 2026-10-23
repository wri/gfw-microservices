/**
 * @name exports
 * @static
 * @summary Build configuration for the splash page (GFW Pro retirement notice)
 */
module.exports = {
  webpack: {
    alias: {
      splash: 'client/splash',
    },
    entry: {
      splash: 'client/splash/index.js',
    },
  },
  build: {
    prerender: {
      'splash-component': 'splash/js/components/Splash.js',
    },
  },
};
