// Set the environment to test in case it is not already set
process.env.NODE_ENV = 'test';
const path = require('path');
const fs = require('fs');
const winston = require('winston');

const clientConfigs = require('../config/client.configs');
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
  // Update our aliases to use the correct expression, like ^js(.*)$": "<rootDir>/src/js$1"
  Object.keys(clientConfigs.aliases).forEach((namespace) => {
    aliases[`^${namespace}(.*)$`] = replacePathWithRootDir(`${clientConfigs.aliases[namespace]}$1`);
  });
  // Update it based on our aliases, and mocks
  jestConfig.moduleNameMapper = {
    '^axios$': replacePathWithRootDir(require.resolve('axios')),
    '^mapshaper$': replacePathWithRootDir(require.resolve('mapshaper')),
    '\\.(css|scss)$': '<rootDir>/test/__mocks__/object.js',
    '\\.(jpe?g|png|gif|svg)$': '<rootDir>/test/__mocks__/object.js',
    '@arcgis/core/symbols/SimpleFillSymbol': '<rootDir>/test/__mocks__/SimpleFillSymbol.js',
    '@arcgis': '<rootDir>/test/__mocks__/object.js',
    'src/client/map/js/layers(.*)$': '<rootDir>/test/__mocks__/constructor.js',
    'map/js/layers/TreeCoverLossLayer': '<rootDir>/test/__mocks__/constructor.js',
    '^tests(.*)$': '<rootDir>/test/client/tests$1',
    '@wri-monorepos/constants': '<rootDir>/../../../libs/constants/src/index.ts',
    '@wri-monorepos/shared': '<rootDir>/../../../libs/shared/src/index.ts',
    '@wri-monorepos/sql': '<rootDir>/../../../libs/sql/src/index.ts',
    '@wri-monorepos/geo': '<rootDir>/../../../libs/geo/src/index.ts',
    '@wri-monorepos/aws': '<rootDir>/../../../libs/aws/src/index.ts',
    ...aliases,
  };
  (jestConfig.modulePathIgnorePatterns = [
    '<rootDir>/node_modules/',
    '<rootDir>/node_modules/@arcgis',
    '<rootDir>/dist/*',
  ]),
    (jestConfig.transformIgnorePatterns = ['node_modules/(?!(@arcgis|@esri|@stencil)/)']),
    // Set the test paths
    (jestConfig.testMatch = [
      `<rootDir>/${assets.clientJest}`,
      `<rootDir>/${assets.serverJest}`,
      `<rootDir>/${assets.configJest}`,
      `<rootDir>/test/fitness/**/*.test.js`,
    ]); // Write the file back out to jestConfig
  fs.writeFileSync(jestConfigPath, JSON.stringify(jestConfig, null, 2), 'utf-8');
} catch (err) {
  logger.error('Error preparing jest configuration file', err);
  throw new Error(`Error preparing jest configuration file ${err}`);
}
