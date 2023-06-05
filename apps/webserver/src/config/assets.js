/**
 * @name exports
 * @static
 * @summary location of all assets
 */
module.exports = {
  scripts: 'server/*/scripts/**/*.js',
  routes: 'server/*/routes/**/*.js',
  build: 'client/*/build.config.js',
  mocha: 'server/*/tests/**/*.js',
  clientJest: 'client/**/*.test.js',
  serverJest: 'server/**/*.spec.js',
  views: 'server/*/views',
};
