import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as webpack from 'webpack';
import * as path from 'node:path';

import config from './config';
import { entries, aliases } from './client.configs';

/**
 * @summary Generate a Webpack configuration based on the environment and purpose
 */
export default (): webpack.Configuration => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const excludes = [];
  const plugins = [];
  const rules = [];

  if (isDevelopment) {
    const hotMiddleware =
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';
    for (const key in entries) {
      entries[key] = [entries[key], hotMiddleware];
    }
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  rules.push(
    {
      test: /\.(js|jsx)$/,
      use: ['thread-loader', 'babel-loader'],
      exclude: /node_modules/,
    },
    {
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: 'thread-loader',
          options: {
            workers: 4,
          },
        },
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            happyPackMode: true,
            compilerOptions: { noEmit: false, sourceMap: isDevelopment },
            configFile: 'client/tsconfig.json',
          },
        },
      ],
      exclude: /node_modules/,
    }
  );

  rules.push({
    test: /\.(scss|css)$/,
    use: [
      { loader: MiniCssExtractPlugin.loader },
      { loader: 'css-loader', options: { esModule: false } },
      { loader: 'postcss-loader' },
      { loader: 'sass-loader' },
    ],
    exclude: excludes,
  });

  // Asset loader (Consider switching to Asset Modules if possible)
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

  const progressLog = (percentage, message, ...args) => {
    console.log(`Webpack progress ${Math.round(percentage * 100)}%:`, message, ...args);
  };

  plugins.push(
    new webpack.ProgressPlugin(progressLog),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].css',
      ignoreOrder: false,
    })
  );

  return {
    ...(config.webpack || {}),
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    entry: entries,
    module: { rules },
    plugins,
    node: { __dirname: true },
    output: {
      publicPath: '/',
      library: {
        name: 'GFWProWebpack',
        type: 'umd',
      },
      path: path.join(process.cwd(), 'public'),
      filename: '[name].[contenthash].js',
    },
    resolve: {
      extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
      alias: aliases,
    },
  };
};
