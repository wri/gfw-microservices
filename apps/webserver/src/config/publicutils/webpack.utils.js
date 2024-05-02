const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
import makeWebpackConfig from '../webpack.config';
const logger = require('../privateutils/logger.utils');
import config from '../config';
const webpack = require('webpack');

/**
 * @name generateAssetMap
 * @summary create a map of compiled assets
 * @param {object} stats - compilation stats from webpack
 * @param {number} index - index of the asset [0 => CSS, 1 => JS]
 * @return {object} asset map
 */
const generateAssetMap = (stats, index) => {
  return Object.keys(stats.assetsByChunkName).reduce((chunks, name) => {
    const asset = stats.assetsByChunkName[name];
    chunks[name] = typeof asset !== 'string' ? asset[index] : asset;
    return chunks;
  }, {});
};

/**
 * @name middleware
 * @summary Start the dev task, update the assets in the config, and return the middleware
 * @return {Object}
 */
const middleware = () => {
  // Create our compiler
  const compiler = webpack(makeWebpackConfig());
  // WHen the compiler completes, update our assets and log any issues
  compiler.hooks.done.tap('done', (statistics) => {
    const stats = statistics.toJson();
    // Check for soft errors or warnings
    if (stats.errors.length) {
      logger.error('###############################################');
      logger.error('### Compilation errors from webpack - START ###');
      logger.error('###############################################');
      logger.error(stats.errors);
      logger.error('###############################################');
      logger.error('### Compilation errors from webpack -  END  ###');
      logger.error('###############################################');
    } else {
      if (stats.warnings.length) {
        logger.warn('#################################################');
        logger.warn('### Compilation warnings from webpack - START ###');
        logger.warn('#################################################');
        logger.warn(stats.warnings);
        logger.warn('#################################################');
        logger.warn('### Compilation warnings from webpack -  END  ###');
        logger.warn('#################################################');
      } else {
        logger.info('############################################################');
        logger.info('### Webpack compilation complete, updating asset map now ###');
        logger.info('############################################################');
      }

      config.compiledAssets.js = Object.assign(
        config.compiledAssets.js,
        generateAssetMap(stats, 1)
      );
      config.compiledAssets.css = Object.assign(
        config.compiledAssets.css,
        generateAssetMap(stats, 0)
      );
      logger.info('############################################################');
      logger.info('config.compiledAssets', config.compiledAssets);
      logger.info('############################################################');
    }
  });

  return {
    dev: webpackDevMiddleware(compiler, { stats: { colors: true } }),
    hot: webpackHotMiddleware(compiler, { path: '/__webpack_hmr' }),
  };
};

module.exports = {
  middleware,
};
