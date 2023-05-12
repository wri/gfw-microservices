/**
 * @name exports
 * @static
 * @summary Test environment configurations
 */
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const path = require('path');

module.exports = {
  port: 3000,
  SQLConnection: {
    host: process.env.MSSQL_HOSTNAME,
    database: process.env.MSSQL_DATABASE,
    username: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD,
  },
  sessionVars: {
    secret: 'TheSecretSession',
  },
  AWSVars: {
    credentials: {
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    },
    cognito: {
      userpoolId: process.env.COGNITO_USERPOOLID,
      clientId: process.env.COGNITO_CLIENTID,
      region: process.env.COGNITO_REGION,
    },
    ses: {
      sender: process.env.SES_SENDER_EMAIL,
    },
    params: {
      Bucket: process.env.BUCKET,
      Prefix: process.env.PREFIX,
    },
  },
  platformVars: {
    accessLevel: {
      Administrator: 1,
      Editor: 2,
      Viewer: 3,
    },
    status: {
      Pending: 1,
      Active: 2,
      Inactive: 3,
      Draft: 4,
      AnalyzingDiagnostic: 5,
      AnalyzingDashboard: 6,
    },
    authenticationStatus: {
      //Status returned as part of Cognito Authentication Process.
      Authenticated: 1, //Authenticated.
      Unauthenticated: 2, //Unauthenticated or invalid username/password.
      RequireNewPassword: 3, //First time user sign in, has default password.
      ConfirmPassword: 4, //In case a user forgot password and requeted a reset. Has verification code.
      Disabled: 5, //User is disabled, not just unauthenticated. For inactive users.
    },
  },
  //
  // mongo: {
  //   db: 'mongodb://mongo/docker-mern',
  //   admin: {
  //     username: process.env.MONGO_ADMIN_USERNAME,
  //     password: process.env.MONGO_ADMIN_PASSWORD
  //   }
  // },

  webpack: {
    devtool: 'source-map',
    cache: true,
    output: {
      path: path.join(process.cwd(), 'public'),
      filename: '[name].[hash].js',
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.LoaderOptionsPlugin({
        options: {
          postcss: [autoprefixer],
        },
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"test"',
        },
      }),
    ],
  },
};
