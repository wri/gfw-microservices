/**
 * @name exports
 * @static
 * @summary QA environment configurations
 */
const autoprefixer = require('autoprefixer');
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
    devtool: 'source-map',
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.LoaderOptionsPlugin({
        options: {
          postcss: [autoprefixer],
        },
      }),
    ],
  },
  devTestUserAuthSecret: process.env.DT_USER_SECRET,
};
