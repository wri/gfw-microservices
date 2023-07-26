const path = require('path');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const slackNotifications = require(path.resolve('./config/privateutils/slackNotifications.utils'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

module.exports = (app, limiter) => {
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/slack-notification', routeMiddlewares);

  app.post('/slack-notification', (req, res) => {
    console.log('POST /slack-notification');
    const { text, data, userInfo } = req.body;
    slackNotifications.sendNotification(text, data, userInfo);
    res.sendStatus(200);
  });
};
