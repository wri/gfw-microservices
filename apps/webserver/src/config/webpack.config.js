/* eslint-disable no-unused-vars */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const path = require('path');
const config = require('./config');

// Grab all the build.config.js files
const configs = config.client.build;

// Merge all the entries together
const entries = configs.reduce((all, conf) => Object.assign(all, conf.webpack.entry), {});

// Merge all the aliases together
const aliases = configs.reduce((all, conf) => Object.assign(all, conf.webpack.alias), {});

// Resolve their paths
for (const key in entries) {
  entries[key] = path.resolve(entries[key]);
}
for (const key in aliases) {
  aliases[key] = path.resolve(aliases[key]);
}

/**
 * @summary Make a webpack config for whatever environment/purpose needed
 */
module.exports = () => {
  // Add environment specific rules that need to get values from configs
  const excludes = [];
  const plugins = [];
  const rules = [];

  if (process.env.NODE_ENV === 'development') {
    // Set up hot reloading in develop
    const webpackHotMiddleware =
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';
    for (const key in entries) {
      entries[key] = [entries[key], webpackHotMiddleware];
    }
  }

  // Add babel loader for javascript
  rules.push({
    test: /\.(js|jsx)$/,
    loader: 'babel-loader',
    exclude: /(node_modules|build)/,
  });

  rules.push({
    test: /\.(tsx)$/,
    use: [
      {
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            noEmit: false,
          },
        },
      },
    ],
    exclude: /node_modules/,
  });

  rules.push({
    test: /\.(scss|css)$/,
    use: [
      { loader: MiniCssExtractPlugin.loader },
      { loader: 'css-loader' },
      { loader: 'postcss-loader' },
      { loader: 'sass-loader' },
    ],
    exclude: excludes,
  });

  // TODO Updated webpack prefers Asset Modules https://webpack.js.org/guides/asset-modules/#root
  rules.push({
    test: /\.(jpe?g|png|mp4|svg)$/i,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash:6]',
          esModule: false,
          publicPath: '/',
          outputPath: '/',
        },
      },
    ],
    type: 'javascript/auto',
  });

  return {
    ...(config.webpack || {}),
    entry: entries,
    module: { rules },
    plugins: [
      ...plugins,
      new webpack.ProgressPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].css',
        ignoreOrder: false,
      }),
    ],
    node: {
      __dirname: true,
    },
    output: {
      publicPath: '',
      library: {
        name: 'GFWProWebpack', // Example name
        type: 'umd',
      },
      path: path.join(process.cwd(), 'public'),
      filename: '[name].[contenthash].js',
    },
    externals: [
      ({ request }, callback) => {
        if (/^dojo|^dojox|^dijit|^esri/.test(request)) {
          callback(null, `umd ${request}`);
        } else {
          callback();
        }
      },
    ],
    resolve: {
      extensions: ['*', '.js', '.jsx', '.tsx'],
      alias: aliases,
    },
  };
};
