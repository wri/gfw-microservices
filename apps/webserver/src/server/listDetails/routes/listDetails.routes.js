const path = require('path');
const controller = require('../controllers/listDetails.controller');
import { upgradeListSchema } from '@wri-monorepos/sql';
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

/**
 * @name exports
 * @static
 * @summary listDetails page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /list-details
   * @see listDetails.controller
   * @memberof Router
   */

  // All methods under /listDetails must pass through middleware
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/list-details', routeMiddlewares);

  app.get('/list-details', (req, res) => {
    console.log('/list-details');
    const locationsData = {
      gfwData: app.get('gfw-data'),
      mapData: app.get('map-data'),
      drawData: app.get('draw-data'),
      locationName: app.get('location-name'),
      fromMap: app.get('from-map'),
      subscriptionStatus: req.session.subscription_status_id,
    };

    controller.listDetails(req, res, locationsData);

    app.set('from-map', false);
    app.set('gfw-data', '');
    app.set('map-data', '');
    app.set('draw-data', '');
    app.set('location-name', '');
  });

  app.get('/list-details/upgrade-version-2', async (req, res) => {
    const { organization_db, organization_user_id } = req.session;
    const { listId } = req.query;

    try {
      await upgradeListSchema({
        listId,
        clientDb: organization_db,
        userId: organization_user_id,
      });
      res.status(200).send({
        success: true,
      });
    } catch (error) {
      console.error('Schema upgrader test route failed');
      throw error;
    }
  });
};
