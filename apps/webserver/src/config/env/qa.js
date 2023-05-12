/**
 * @name exports
 * @static
 * @summary QA environment configurations
 */
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');

module.exports = {
  port: 8443,
  app: {
    author: 'World Resource Institute',
    title: 'Global Forest Watch Pro',
    keywords: 'Express, React, Redux, Node, Docker, GraphQL, Pug',
    description: 'Global Forest Watch Pro Application.',
  },
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
};
