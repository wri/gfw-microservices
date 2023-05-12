/**
 * @name exports
 * @static
 * @summary Development environment configurations
 */
const webpack = require('webpack');

module.exports = {
  port: 8443,
  compiledAssets: {
    // Storage location for compiled assets.
    js: {},
    css: {},
  },
  webpack: {
    mode: 'development',
    devtool: 'eval-source-map',
    plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin()],
  },
};
