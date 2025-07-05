const path = require('path');
const { z } = require('zod');

const controller = require('../controllers/listDetails.controller');
import { upgradeListSchema } from '@wri-monorepos/sql';
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

const querySchema = z.object({
  listId: z.coerce.number().int().positive('listId must be a positive number'),
});

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
    const parseQuery = querySchema.safeParse(req.query);
    if (!parseQuery.success) {
      return res.status(400).json({
        success: false,
        errors: parseQuery.error.flatten(),
      });
    }
    const { organization_database, organization_user_id } = req.session;
    const { listId } = parseQuery.data;
    try {
      const list = await upgradeListSchema({
        listId,
        clientDb: organization_database,
        userId: organization_user_id,
      });
      res.status(200).send({
        success: true,
        data: list,
      });
    } catch (error) {
      console.error('Schema upgrader test route failed');
      res.status(500).send({
        success: false,
        message: 'Internal server error while upgrading schema',
      });
    }
  });
};
