/**
 * @name exports
 * @static
 * @summary Production environment configurations
 */
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');

module.exports = {
  port: 80,
  app: {
    author: 'World Resource Institute',
    title: 'Global Forest Watch Pro',
    keywords: 'Express, React, Redux, Node, Docker',
    description: 'Global Forest Watch Pro Application.',
  },
  compiledAssets: {
    // Storage location for compiled assets.
    js: {},
    css: {},
  },
  webpack: {
    mode: 'production',
    plugins: [
      new webpack.LoaderOptionsPlugin({
        options: {
          postcss: [autoprefixer],
        },
      }),
    ],
  },
};
