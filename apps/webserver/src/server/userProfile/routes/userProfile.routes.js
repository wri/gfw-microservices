const path = require('path');
const controller = require('../controllers/userProfile.controller');

const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

/**
 * @name exports
 * @static
 * @summary User Profile page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /user-profile
   * @see userProfile.controller
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

  app.use('/user-profile/', routeMiddlewares);
  app.get('/user-profile/', controller.userProfile);

  app.use('/user-profile-data/:user_id', routeMiddlewares);
  app.get('/user-profile-data/:user_id', controller.userProfileData);

  app.get('/user-profile-data/new', routeMiddlewares);
  app.get('/user-profile-data/new', controller.createNewUserProfile);
};
