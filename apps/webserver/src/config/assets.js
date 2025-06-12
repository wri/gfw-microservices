/**
 * @name exports
 * @static
 * @summary location of all assets
 */
module.exports = {
  scripts: 'server/*/scripts/**/*.js',
  routes: 'server/*/routes/**/*.{js,ts}',
  build: 'client/*/build.config.js',
  mocha: 'server/*/tests/**/*.js',
  clientJest: 'client/**/*.{spec,test}.{js,ts,jsx,tsx}',
  serverJest: 'server/**/*.{spec,test}.{js,ts}',
  configJest: 'config/**/*.{spec,test}.{js,ts}',
  views: 'server/*/views',
};
