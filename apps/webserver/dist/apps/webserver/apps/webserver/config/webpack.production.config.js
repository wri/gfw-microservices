/**
 * @name exports
 * @static
 * @summary Production environment configurations
 */
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

module.exports = {
  mode: 'production',
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [autoprefixer],
      },
    }),
  ],
};
