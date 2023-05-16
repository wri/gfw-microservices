/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { exit } = require('process');
const logger = require('./config/lib/winston');
const loadenv = require('./load-env');
const { PRODUCTION_ENVIRONMENTS } = require('./config/config/environments.config');
/**
 * @description Files/modules that require the config or environment variables are required to be imported
 *              after `loadenv.loadEnvironmentVars`has successfully completed
 */

logger.info('Starting the application');

process.on('SIGINT', () => {
  console.log('Stopping container');
  exit(0);
});

const app = express();
// Load all the neccesary environment variables.
loadenv
  .loadEnvironmentVars(process.env.NODE_ENV)
  .then(() => {
    console.log('REDIS', process.env.REDIS_HOST, process.env.REDIS_PORT);

    // Initialize all neccesary modules.
    return Promise.all([
      require('./config/config'),
      require('./config/lib/express').initialize(app),
      require(path.resolve('./config/publicutils/accountManager.utils')).initialize(),
      require(path.resolve('./config/publicutils/gfwListManager.utils')).initialize(),
      require(path.resolve('./config/publicutils/userManager.utils')).initialize(),
      require(path.resolve('./config/privateutils/logger.utils')).initialize(),
      require(path.resolve('./config/privateutils/cognito.utils')).initialize(),
      require(path.resolve('./config/privateutils/ses.utils')).initialize(),
      require(path.resolve('./server/vectorTiles/utils/vectorTileSQS.utils')).initialize(),
    ]);
  })
  .then((initializations) => {
    // Obtaining config and app from initializations.
    const [config] = initializations;
    // Setup Express to listen on https port for everything but production.
    // NOTE: Production SSL is handled via the Load Balancer.
    // NOTE: test does not use SSL
    if (!PRODUCTION_ENVIRONMENTS.includes(process.env.NODE_ENV) && process.env.NODE_ENV !== 'test') {
      const sslOptions = {
        key: fs.readFileSync(`/srv/src/config/ssl/${process.env.NODE_ENV}/gfwpro.key`),
        cert: fs.readFileSync(`/srv/src/config/ssl/${process.env.NODE_ENV}/gfwpro.crt`),
      };
      https.createServer(sslOptions, app).listen(config.port);
      logger.info(`App listening on port: ${config.port}`);
    } else {
      http.createServer(app).listen(config.port);
      logger.info(`App listening on port: ${config.port}`);
    }
    app.emit('appReady', null);
  })
  .catch((error) => {
    logger.error('Error initializing application', error);
    exit();
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

      if (now > endTime) {
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
