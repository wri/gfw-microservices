import * as winston from 'winston';
import * as assets from './assets';
import * as path from 'path';
import * as glob from 'glob';
import * as common from './env/common';
import * as clientConfigs from './client.configs';

// basic logger without sql transport
const logger = winston.createLogger({ transports: [new winston.transports.Console()] });

const getFilePaths = () => ({
  files: {
    // Get scripts
    scripts: glob.sync(assets.scripts),
    // Get express routes
    routes: glob.sync(assets.routes),
    // Get mocha tests
    mocha: glob.sync(assets.mocha),
    // Get views
    views: glob.sync(assets.views),
  },
});

// Get all CSS and JS files from public folder
function getAllCssJSFiles() {
  const FOLDER_PATTERN = 'public/';

  const files = glob.sync(`${FOLDER_PATTERN}*.{js,css}`);
  const cssFilesObject = {};
  const jsFilesObject = {};

  files.forEach((file) => {
    if (file.endsWith('.css')) {
      const cssFileName = file.replace(FOLDER_PATTERN, '');
      const cssFileNamePage = cssFileName.split('.')[0];
      cssFilesObject[cssFileNamePage] = cssFileName;
    } else if (file.endsWith('.js')) {
      const jsFileName = file.replace(FOLDER_PATTERN, '');
      const jsFileNamePage = jsFileName.split('.')[0];
      jsFilesObject[jsFileNamePage] = jsFileName;
    }
  });

  return {
    compiledAssets: {
      css: cssFilesObject,
      js: jsFilesObject,
    },
  };
}

interface Config {
  // common config
  app: {
    author: string;
    title: string;
    keywords: string;
    description: string;
  };
  SQLConnection: {
    host: string;
    port: string;
    username: string;
    password: string;
    database: string;
    logDatabase: string;
  };
  sessionVars: {
    secret: string;
  };
  AWSVars: {
    credentials: {
      accessKey: string;
      secretKey: string;
      region: string;
    };
    cognito: {
      userpoolId: string;
      clientId: string;
      region: string;
    };
    ses: {
      sender: string;
    };
    policyParams: {
      bucket: string;
      key: string;
      keyPending: string;
    };
    sns: {
      topicARN: string;
    };
    sqs: {
      location_queue_url: string;
      list_queue_url: string;
    };
    s3: {
      analysisBucket: string;
    };
  };
  platformVars: {
    accessLevel: {
      Administrator: number;
      Editor: number;
      Viewer: number;
    };
    authenticationStatus: {
      Authenticated: number;
      Unauthenticated: number;
      RequireNewPassword: number;
      ConfirmPassword: number;
      Disabled: number;
      ResetRequired: number;
      ForceReset: number;
      ResendPassword: number;
    };
    authenticationPreference: {
      Email: number;
      GoogleAuthenticator: number;
    };
    emailFrequency: {
      never: number;
      everyQuarter: number;
      everyMonth: number;
      everyWeek: number;
      everyDay: number;
    };
    emailType: {
      NEW_ORGANIZATION: string;
      REQUEST_ORGANIZATION: string;
      ORGANIZATION_ACTIVATED: string;
      VERIFY_AUTHENTICATION: string;
      INVITATION: string;
      LIST_ANALYSIS_STARTED: string;
      LIST_ANALYSIS_SUCCESS: string;
      LIST_ANALYSIS_RERUN_SUCCESS: string;
      LIST_ANALYSIS_ERROR: string;
      ANALYSIS_LIMIT_REACHED: string;
      // Sharing
      INTERNAL_LIST_DISABLE: string;
      INTERNAL_LIST_ENABLE: string;
      EXTERNAL_LIST_DISABLE: string;
      EXTERNAL_LIST_ENABLE: string;
      ORGANIZATION_APPROVED: string;
      // GFW Lists
      UPDATE_GFWLISTS: string;
    };
    snsType: {
      NEW_ORGANIZATION: string;
      UPDATE_GFWLIST: string;
    };
    maxUserLoginRetries: number;
  };

  // environment config
  port: number;
  compiledAssets: {
    css: any;
    js: any;
  };
  webpack: {
    mode: 'none' | 'development' | 'production';
    plugins: any[];
    devtool: string;
  };
  devTestUserAuthSecret: string;

  // getFilePaths()
  files: {
    scripts: string[];
    routes: string[];
    mocha: string[];
    views: string[];
  };

  // getClientConfig()
  client: {
    build: any[];
  };
}

const make = (): Config => {
  // Validate the NODE_ENV and set a default if not provided
  if (process.env.NODE_ENV === null || process.env.NODE_ENV === undefined) {
    logger.warn('NODE_ENV is not set, setting to "development"');
    process.env.NODE_ENV = 'development';
  }

  // Get the default config
  //const defaultConfig = require(path.resolve('./config/env/default'));

  // Get the environment config
  let environmentConfig = {};
  try {
    environmentConfig = require(path.resolve(`./config/env/${process.env.NODE_ENV}`));
    console.log('Matching Config found: ', process.env.NODE_ENV);
    // console.log('environmentConfig', environmentConfig);
  } catch (err) {
    logger.error(`No configuration files found matching environment ${process.env.NODE_ENV}`, err);
  }
  // Get assets config
  const filesConfig = getFilePaths();

  // TODO: During development, remove some of the paths to pages I don't currently care about; this
  // webpack compile process is taking forever now that we have so many different html pages How?
  // --> In our assets.js file, specify the page you care about in routes & views Ex: Map work:
  // routes: "'server/map/routes/**/*.js'" rather than "routes: 'server/*/routes/**/*.js'" Edit
  // UPDATE 2019-11-14: This is probably still a good idea, but no longer as pressing because the
  // webpack compile speed has been improved.

  // Get the client config
  const clientConfig = {
    client: {
      build: clientConfigs.clientBuild,
    },
  };

  let compiledAssets = {};
  if (process.env.NODE_ENV !== 'development') {
    try {
      compiledAssets = getAllCssJSFiles();
      logger.info('===================');
      logger.info(
        `Compiled Assets JS and CSS builds NODE_ENV === ${process.env.NODE_ENV}:`,
        JSON.stringify(compiledAssets)
      );
      logger.info('===================');
    } catch (err) {
      logger.warn(
        `No compiled assets JS and CSS files found matching environment ${process.env.NODE_ENV}`
      );
    }
  }

  // TODO: For initial testing, remove when done testing - Start
  logger.info('===================');
  logger.info('environmentConfig', JSON.stringify(environmentConfig));
  logger.info('===================');
  // TODO: For initial testing, remove when done testing - End

  //return Object.assign({}, defaultConfig, environmentConfig, filesConfig, clientConfig);
  return Object.assign({}, common, environmentConfig, filesConfig, clientConfig, compiledAssets);
};

export default make();
