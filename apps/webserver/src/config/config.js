const logger = require('./lib/winston');
const assets = require('./assets');
const path = require('path');
const glob = require('glob');
const common = require('./env/common');

const getFilePaths = () => ({
  files: {
    // Get scripts
    scripts: glob.sync(assets.scripts),
    // Get express routes
    routes: glob.sync(assets.routes),
    // Get mocha tests
    mocha: glob.sync(assets.mocha),
    // Get views
    views: glob.sync(assets.views),
  },
});

const getClientConfig = () => ({
  client: {
    build: glob.sync(assets.build).map((conf) => require(path.resolve(conf))),
  },
});

// Get all CSS and JS files from public folder
function getAllCssJSFiles() {
  const FOLDER_PATTERN = 'public/';

  const files = glob.sync(`${FOLDER_PATTERN}*.{js,css}`);
  const cssFilesObject = {};
  const jsFilesObject = {};

  files.forEach((file) => {
    if (file.endsWith('.css')) {
      const cssFileName = file.replace(FOLDER_PATTERN, '');
      const cssFileNamePage = cssFileName.split('.')[0];
      cssFilesObject[cssFileNamePage] = cssFileName;
    } else if (file.endsWith('.js')) {
      const jsFileName = file.replace(FOLDER_PATTERN, '');
      const jsFileNamePage = jsFileName.split('.')[0];
      jsFilesObject[jsFileNamePage] = jsFileName;
    }
  });

  return {
    compiledAssets: {
      css: cssFilesObject,
      js: jsFilesObject,
    },
  };
}

const make = () => {
  // Validate the NODE_ENV and set a default if not provided
  if (process.env.NODE_ENV === null || process.env.NODE_ENV === undefined) {
    logger.warn('NODE_ENV is not set, setting to "development"');
    process.env.NODE_ENV = 'development';
  }

  // Get the default config
  //const defaultConfig = require(path.resolve('./config/env/default'));

  // Get the environment config
  let environmentConfig = {};
  try {
    environmentConfig = require(path.resolve(`./config/env/${process.env.NODE_ENV}`));
    console.log('Matching Config found: ', process.env.NODE_ENV);
    // console.log('environmentConfig', environmentConfig);
  } catch (err) {
    logger.warn(`No configuration files found matching environment ${process.env.NODE_ENV}`);
  }
  // Get assets config
  const filesConfig = getFilePaths();

  // TODO: During development, remove some of the paths to pages I don't currently care about; this
  // webpack compile process is taking forever now that we have so many different html pages How?
  // --> In our assets.js file, specify the page you care about in routes & views Ex: Map work:
  // routes: "'server/map/routes/**/*.js'" rather than "routes: 'server/*/routes/**/*.js'" Edit
  // UPDATE 2019-11-14: This is probably still a good idea, but no longer as pressing because the
  // webpack compile speed has been improved.

  // Get the client config
  const clientConfig = getClientConfig();

  let compiledAssets = {};
  if (process.env.NODE_ENV !== 'development') {
    try {
      compiledAssets = getAllCssJSFiles();
      logger.info('===================');
      logger.info(
        `Compiled Assets JS and CSS builds NODE_ENV === ${process.env.NODE_ENV}:`,
        JSON.stringify(compiledAssets)
      );
      logger.info('===================');
    } catch (err) {
      logger.warn(`No compiled assets JS and CSS files found matching environment ${process.envExp.NODE_ENV}`);
    }
  }

  // TODO: For initial testing, remove when done testing - Start
  logger.info('===================');
  logger.info('environmentConfig', JSON.stringify(environmentConfig));
  logger.info('===================');
  // TODO: For initial testing, remove when done testing - End

  //return Object.assign({}, defaultConfig, environmentConfig, filesConfig, clientConfig);
  return Object.assign({}, common, environmentConfig, filesConfig, clientConfig, compiledAssets);
};

module.exports = make();