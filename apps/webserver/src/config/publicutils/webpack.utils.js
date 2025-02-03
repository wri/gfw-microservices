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
    if (!stats.errors.length && !stats.warnings.length) {
      const newJsAssets = generateAssetMap(stats, 1);
      const newCssAssets = generateAssetMap(stats, 0);

      if (
        JSON.stringify(config.compiledAssets.js) !== JSON.stringify(newJsAssets) ||
        JSON.stringify(config.compiledAssets.css) !== JSON.stringify(newCssAssets)
      ) {
        config.compiledAssets.js = newJsAssets;
        config.compiledAssets.css = newCssAssets;
        logger.info('### Updated asset map ###', config.compiledAssets);
      }
    }
  });

  return {
    dev: webpackDevMiddleware(compiler, {
      stats: 'minimal',
      publicPath: '/',
      writeToDisk: false,
      serverSideRender: true,
    }),
    hot: webpackHotMiddleware(compiler, { path: '/__webpack_hmr' }),
  };
};

module.exports = {
  middleware,
};
