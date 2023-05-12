/**
 * @name exports
 * @static
 * @summary QA environment configurations
 */
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');

module.exports = {
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
};
