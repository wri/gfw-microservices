/* eslint-disable import/no-dynamic-require */
// Set the environment to test in case it is not already set
process.env.NODE_ENV = 'test';
const path = require('path');
const fs = require('fs');
const winston = require('winston');

const makeWebpackConfig = require('../config/webpack.config');
const assets = require('../config/assets');

// basic logger without sql transport
const logger = winston.createLogger({ transports: [new winston.transports.Console()] });

const jestConfigPath = path.resolve('./jest.config.json');
const aliases = {};

// Replace fixed paths with <rootDir> relative paths
const replacePathWithRootDir = (fixedPath) => {
  if (/.*gfw-microservices\/apps\/webserver\/src/.test(fixedPath)) {
    return fixedPath.replace(/.*gfw-microservices\/apps\/webserver\/src/, '<rootDir>');
  }
  return fixedPath.replace(/.*gfw-microservices/, '<rootDir>/../../..');
};

try {
  // Read in our base jest config
  const jestConfig = JSON.parse(fs.readFileSync(jestConfigPath, 'utf-8'));
  // Grab our aliases
  const { alias } = makeWebpackConfig().resolve;
  // Update our aliases to use the correct expression, like ^js(.*)$": "<rootDir>/src/js$1"
  Object.keys(alias).forEach((namespace) => {
    aliases[`^${namespace}(.*)$`] = replacePathWithRootDir(`${alias[namespace]}$1`);
  });
  // Update it based on our aliases, and mocks
  jestConfig.moduleNameMapper = {
    '^axios$': replacePathWithRootDir(require.resolve('axios')),
    '^mapshaper$': replacePathWithRootDir(require.resolve('mapshaper')),
    '\\.(css|scss)$': '<rootDir>/test/__mocks__/object.js',
    '\\.(jpe?g|png|gif|svg)$': '<rootDir>/test/__mocks__/object.js',
    // 'material-ui/Popover': '<rootDir>/__mocks__/constructor.js',
    'src/client/map/js/layers(.*)$': '<rootDir>/test/__mocks__/constructor.js',
    'map/js/layers/TreeCoverLossLayer': '<rootDir>/test/__mocks__/constructor.js',
    'esri/Map': '<rootDir>/test/__mocks__/constructor.js',
    'esri/tasks/QueryTask': '<rootDir>/test/__mocks__/QueryTask.js',
    'esri/tasks/support/Query': '<rootDir>/test/__mocks__/constructor.js',
    'esri/views/MapView': '<rootDir>/test/__mocks__/MapView.js',
    'esri/config': '<rootDir>/test/__mocks__/config.js',
    '^tests(.*)$': '<rootDir>/test/client/tests$1',
    '^dojo(.*)$': '<rootDir>/test/__mocks__/object.js',
    '^esri(.*)$': '<rootDir>/test/__mocks__/object.js',
    '^dijit(.*)$': '<rootDir>/test/__mocks__/object.js',
    '@wri-monorepos/constants': '<rootDir>/../../../libs/constants/src/index.ts',
    '@wri-monorepos/shared': '<rootDir>/../../../libs/shared/src/index.ts',
    '@wri-monorepos/sql': '<rootDir>/../../../libs/sql/src/index.ts',
    '@wri-monorepos/subscription': '<rootDir>/../../../libs/subscription/src/index.ts',
    ...aliases,
  };
  // Set the test paths
  jestConfig.testMatch = [
    `<rootDir>/${assets.clientJest}`,
    `<rootDir>/${assets.serverJest}`,
    `<rootDir>/${assets.configJest}`,
    `<rootDir>/test/fitness/**/*.test.js`,
  ]; // Write the file back out to jestConfig
  fs.writeFileSync(jestConfigPath, JSON.stringify(jestConfig, null, 2), 'utf-8');
} catch (err) {
  logger.error('Error preparing jest configuration file', err);
  throw new Error('Error preparing jest configuration file', err);
}
