const path = require('path');
const controller = require('../controllers/select.controller');
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

/**
 * @name exports
 * @static
 * @summary Analytics page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /select
   * @see select.controller
   * @memberof Router
   */

  // All methods must under /select must pass through middleware
  const routeMiddlewares = [middlewares.checkRecognized];
  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitUnauthenticated));
  }
  app.use('/select', routeMiddlewares);

  app.get('/select', controller.select);

  app.post('/select/org', (req, res) => {
    const { org_id, org_db, org_user_id, org_status_id, subscription_status_id } = req.body;
    const organization = {
      organization_id: org_id,
      organization_db: org_db,
      organization_user_id: org_user_id,
      organization_status_id: org_status_id,
      subscription_status_id: subscription_status_id,
    };
    AuthManager.setOrgSessions(req, organization)
      .then(() => {
        res.send('Locations');
      })
      .catch((err) => {
        res.send('Selecting Org failed');
        console.log(err);
      });
  });
};
