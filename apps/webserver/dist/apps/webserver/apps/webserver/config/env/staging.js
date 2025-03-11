/**
 * @name exports
 * @static
 * @summary Staging environment configurations
 */
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');

module.exports = {
  port: 443,
  compiledAssets: {
    // Storage location for compiled assets.
    js: {},
    css: {},
  },
  webpack: {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
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
