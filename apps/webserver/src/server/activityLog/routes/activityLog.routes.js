const path = require('path');

import config from '../../../config/config';
const { compiledAssets } = config;
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const ActivityLogger = require(path.resolve('./config/privateutils/logger.utils'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

/**
 * @name exports
 * @static
 * @summary Activity log page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /activity-log
   * @see activityLog.controller
   * @memberof Router
   */

  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/activity-log', routeMiddlewares);

  app.get('/activity-log', (req, res) => {
    console.log('GET /activity-log');
    res.render('activityLog', {
      common: compiledAssets.js.common,
      activityLogjs: compiledAssets.js.activityLog,
      activityLogcss: compiledAssets.css.activityLog,
    });
  });

  app.post('/activityLog', (req, res) => {
    console.log('POST /activityLog');
    ActivityLogger.getActivityLog(req)
      .then((activityLog) => {
        res.send({
          activityLog,
        });
      })
      .catch((err) => {
        console.log('Error retrieving log', err);
      });
  });
};
