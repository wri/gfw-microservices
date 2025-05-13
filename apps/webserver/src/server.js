/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { exit } = require('process');
const winston = require('winston');
const loadenv = require('./load-env');
const { PRODUCTION_ENVIRONMENTS } = require('./config/config/environments.config');
/**
 * @description Files/modules that require the config or environment variables are required to be imported
 *              after `loadenv.loadEnvironmentVars`has successfully completed
 */

// basic logger without sql transport
const logger = winston.createLogger({ transports: [new winston.transports.Console()] });

logger.info('Starting the application');

process.on('SIGINT', () => {
  console.log('Stopping container for SIGINT');
  exit(0);
});
process.on('SIGTERM', () => {
  console.log('Stopping container for SIGTERM');
  exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err?.stack || err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`);
});

// Validate the NODE_ENV and set a default if not provided
if (process.env.NODE_ENV === null || process.env.NODE_ENV === undefined) {
  logger.warn('NODE_ENV is not set, setting to "development"');
  process.env.NODE_ENV = 'development';
}

// chdir needed because several require() calls use paths relative to webserver/src
process.chdir(__dirname);

const app = express();
// Load all the neccesary environment variables.
loadenv
  .loadEnvironmentVars(process.env.NODE_ENV)
  .then(() => {
    console.log('REDIS', process.env.REDIS_HOST, process.env.REDIS_PORT);
    return require('./config/config').default; // Load config first to get the port
  })
  .then((config) => {
    // Start server immediately
    let server;
    if (
      !PRODUCTION_ENVIRONMENTS.includes(process.env.NODE_ENV) &&
      process.env.NODE_ENV !== 'test'
    ) {
      const sslOptions = {
        key: fs.readFileSync(path.join(__dirname, `config/ssl/${process.env.NODE_ENV}/gfwpro.key`)),
        cert: fs.readFileSync(
          path.join(__dirname, `config/ssl/${process.env.NODE_ENV}/gfwpro.crt`)
        ),
      };
      server = https.createServer(sslOptions, app);
    } else {
      server = http.createServer(app);
    }

    server.listen(config.port, () => {
      logger.info(`App listening on port: ${config.port}`);
    });

    // Initialize all necessary modules in parallel without blocking the server
    return Promise.all([
      require('./config/lib/express').initialize(app),
      require(path.resolve('./config/publicutils/gfwListManager.utils')).initialize(),
      require(path.resolve('./config/publicutils/userManager.utils')).initialize(),
      require(path.resolve('./config/privateutils/cognito.utils')).initialize(),
      require(path.resolve('./server/vectorTiles/utils/vectorTileSQS.utils')).initialize(),
    ]);
  })
  .then(() => {
    app.emit('appReady', null);
  })
  .catch((error) => {
    logger.error('Error initializing application', error);
    exit(1);
  });

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

setInterval(() => {
  walkDir('./vectorTiles/', (filePath) => {
    fs.stat(filePath, (err, stat) => {
      const now = new Date().getTime();
      const endTime = new Date(stat.mtime).getTime() + 86400000; // 1days in miliseconds

      if (err) {
        return console.error(err);
      }

      if (now > endTime && !filePath.endsWith('.gitkeep')) {
        return fs.unlink(filePath, (unlinkErr) => {
          if (err) {
            return console.error(unlinkErr);
          }
          return console.log(`Deleted file ${filePath}`);
        });
      }
      return null;
    });
  });
}, 60000); // every 5 hours

module.exports = app;
