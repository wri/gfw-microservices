const path = require('path');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const slackUtils = require(path.resolve('./config/privateutils/slackNotifications.utils'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
const { getUserInfo } = require('../../../config/publicutils/authenticationManager.utils');
const logger = require('../../../config/privateutils/logger.utils');

module.exports = (app, limiter) => {
  const routeMiddlewares = [middlewares.checkActive, middlewares.checkInactivity];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/slack-notification', routeMiddlewares);

  app.post('/slack-notification', async (req, res) => {
    const { url, stackTrace, browserInfo } = req.body;
    const { organization_id } = req.session;
    let userInfo = null;

    if (organization_id != undefined) {
      try {
        userInfo = await getUserInfo(req);
        userInfo.OrgID = organization_id;
      } catch (error) {
        logger.error('Could not getUserInfo', error.stack || error);
      }
    } else {
      logger.info('GFWProErrorBoundary user not authenticated');
    }

    const slackMessage = slackUtils.buildSlackNotificationMessage({
      url,
      stackTrace,
      browserInfo,
      userInfo
    });

    await slackUtils.sendNotification(slackMessage);
    res.sendStatus(200);
  });
};
