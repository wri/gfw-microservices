const path = require('path');

const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

const controller = require('../controllers/dataApi.controller');
const { describeLatLongLookups } = require('@wri-monorepos/shared');

module.exports = (app, limiter) => {
  /**
   * @name /dataApi
   * @see dataApi.controller
   * @memberof Router
   */

  // All methods under /locations must pass through middleware
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  // Implement middlewares check
  app.use('/dataApi', routeMiddlewares);

  app.post('/dataApi/getInfoBubbleData/:infoBubbleId', controller.getInfoBubbleDataController);

  app.post('/dataApi/getMetadataTaskData/:metadataID', controller.getMetadataTaskData);

  app.post('/dataApi/analysisGLAD/', controller.getAnalysisGLAD);

  app.post('/dataApi/analysisVIIRS/', controller.getAnalysisVIIRS);

  app.post('/dataApi/analysisPRODES/', controller.getAnalysisPRODES);

  app.post('/dataApi/analysisTreeCoverLoss/', controller.analysisTreeCoverLoss);

  app.post('/dataApi/analysisTreeCoverGain/', controller.analysisTreeCoverGain);

  app.post('/dataApi/analysisTreeBiomassLoss/', controller.analysisTreeBiomassLoss);

  app.post('/dataApi/analysisTreeBiomassTotal/', controller.analysisTreeBiomassTotal);

  app.post('/dataApi/analysisAdminRegion/', controller.analysisAdminRegion);

  app.post('/dataApi/getPalmOilMillLatLong/', controller.getPalmOilMillLatLong);

  app.post('/dataApi/getBBoxAndGeostoreIDs/', controller.getBBoxAndGeostoreIDs);

  app.get('/dataApi/lat-long-lookups', async (req, res) => {
    try {
      const descriptionData = await describeLatLongLookups();

      res.status(200).send(descriptionData);
    } catch (error) {
      throw error;
    }
  });
};
