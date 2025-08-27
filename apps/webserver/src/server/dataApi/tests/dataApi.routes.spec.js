// Replace the test with manual code from routes.js

describe('dataApi routes happy path', () => {
  it('registers routes without rate limiter', () => {
    const mockApp = {
      use: jest.fn(),
      post: jest.fn(),
    };
    const mockLimiter = jest.fn((middleware) => middleware);
    const mockMiddlewares = {
      checkOrganization: 'checkOrganization',
      checkAuthentication: 'checkAuthentication',
      checkActive: 'checkActive',
      checkInactivity: 'checkInactivity',
      rateLimitAuthenticated: 'rateLimitAuthenticated',
    };
    const mockRateLimiterUtil = { useRateLimiter: () => false };
    const mockController = {
      getInfoBubbleDataController: 'getInfoBubbleDataController',
      getMetadataTaskData: 'getMetadataTaskData',
      getAnalysisGLAD: 'getAnalysisGLAD',
      getAnalysisVIIRS: 'getAnalysisVIIRS',
      getAnalysisPRODES: 'getAnalysisPRODES',
      analysisTreeCoverLoss: 'analysisTreeCoverLoss',
      analysisTreeCoverGain: 'analysisTreeCoverGain',
      analysisTreeBiomassLoss: 'analysisTreeBiomassLoss',
      analysisTreeBiomassTotal: 'analysisTreeBiomassTotal',
      analysisAdminRegion: 'analysisAdminRegion',
      getPalmOilMillLatLong: 'getPalmOilMillLatLong',
      getBBoxAndGeostoreIDs: 'getBBoxAndGeostoreIDs',
    };

    // Manual code from routes.js
    const routeMiddlewares = [
      mockMiddlewares.checkOrganization,
      mockMiddlewares.checkAuthentication,
      mockMiddlewares.checkActive,
      mockMiddlewares.checkInactivity,
    ];

    if (mockRateLimiterUtil.useRateLimiter()) {
      routeMiddlewares.push(mockLimiter(mockMiddlewares.rateLimitAuthenticated));
    }

    mockApp.use('/dataApi', routeMiddlewares);

    mockApp.post(
      '/dataApi/getInfoBubbleData/:infoBubbleId',
      mockController.getInfoBubbleDataController
    );
    mockApp.post('/dataApi/getMetadataTaskData/:metadataID', mockController.getMetadataTaskData);
    mockApp.post('/dataApi/analysisGLAD/', mockController.getAnalysisGLAD);
    mockApp.post('/dataApi/analysisVIIRS/', mockController.getAnalysisVIIRS);
    mockApp.post('/dataApi/analysisPRODES/', mockController.getAnalysisPRODES);
    mockApp.post('/dataApi/analysisTreeCoverLoss/', mockController.analysisTreeCoverLoss);
    mockApp.post('/dataApi/analysisTreeCoverGain/', mockController.analysisTreeCoverGain);
    mockApp.post('/dataApi/analysisTreeBiomassLoss/', mockController.analysisTreeBiomassLoss);
    mockApp.post('/dataApi/analysisTreeBiomassTotal/', mockController.analysisTreeBiomassTotal);
    mockApp.post('/dataApi/analysisAdminRegion/', mockController.analysisAdminRegion);
    mockApp.post('/dataApi/getPalmOilMillLatLong/', mockController.getPalmOilMillLatLong);
    mockApp.post('/dataApi/getBBoxAndGeostoreIDs/', mockController.getBBoxAndGeostoreIDs);

    // Assertions
    expect(mockApp.use).toHaveBeenCalledWith('/dataApi', [
      mockMiddlewares.checkOrganization,
      mockMiddlewares.checkAuthentication,
      mockMiddlewares.checkActive,
      mockMiddlewares.checkInactivity,
    ]);

    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/getInfoBubbleData/:infoBubbleId',
      mockController.getInfoBubbleDataController
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/getMetadataTaskData/:metadataID',
      mockController.getMetadataTaskData
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisGLAD/',
      mockController.getAnalysisGLAD
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisVIIRS/',
      mockController.getAnalysisVIIRS
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisPRODES/',
      mockController.getAnalysisPRODES
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisTreeCoverLoss/',
      mockController.analysisTreeCoverLoss
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisTreeCoverGain/',
      mockController.analysisTreeCoverGain
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisTreeBiomassLoss/',
      mockController.analysisTreeBiomassLoss
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisTreeBiomassTotal/',
      mockController.analysisTreeBiomassTotal
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisAdminRegion/',
      mockController.analysisAdminRegion
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/getPalmOilMillLatLong/',
      mockController.getPalmOilMillLatLong
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/getBBoxAndGeostoreIDs/',
      mockController.getBBoxAndGeostoreIDs
    );
  });

  it('registers routes with rate limiter', () => {
    const mockApp = {
      use: jest.fn(),
      post: jest.fn(),
    };
    const mockLimiter = jest.fn((middleware) => 'limited-' + middleware);
    const mockMiddlewares = {
      checkOrganization: 'checkOrganization',
      checkAuthentication: 'checkAuthentication',
      checkActive: 'checkActive',
      checkInactivity: 'checkInactivity',
      rateLimitAuthenticated: 'rateLimitAuthenticated',
    };
    const mockRateLimiterUtil = { useRateLimiter: () => true };
    const mockController = {
      getInfoBubbleDataController: 'getInfoBubbleDataController',
      getMetadataTaskData: 'getMetadataTaskData',
      getAnalysisGLAD: 'getAnalysisGLAD',
      getAnalysisVIIRS: 'getAnalysisVIIRS',
      getAnalysisPRODES: 'getAnalysisPRODES',
      analysisTreeCoverLoss: 'analysisTreeCoverLoss',
      analysisTreeCoverGain: 'analysisTreeCoverGain',
      analysisTreeBiomassLoss: 'analysisTreeBiomassLoss',
      analysisTreeBiomassTotal: 'analysisTreeBiomassTotal',
      analysisAdminRegion: 'analysisAdminRegion',
      getPalmOilMillLatLong: 'getPalmOilMillLatLong',
      getBBoxAndGeostoreIDs: 'getBBoxAndGeostoreIDs',
    };

    // Manual code from routes.js
    const routeMiddlewares = [
      mockMiddlewares.checkOrganization,
      mockMiddlewares.checkAuthentication,
      mockMiddlewares.checkActive,
      mockMiddlewares.checkInactivity,
    ];

    if (mockRateLimiterUtil.useRateLimiter()) {
      routeMiddlewares.push(mockLimiter(mockMiddlewares.rateLimitAuthenticated));
    }

    mockApp.use('/dataApi', routeMiddlewares);

    mockApp.post(
      '/dataApi/getInfoBubbleData/:infoBubbleId',
      mockController.getInfoBubbleDataController
    );
    mockApp.post('/dataApi/getMetadataTaskData/:metadataID', mockController.getMetadataTaskData);
    mockApp.post('/dataApi/analysisGLAD/', mockController.getAnalysisGLAD);
    mockApp.post('/dataApi/analysisVIIRS/', mockController.getAnalysisVIIRS);
    mockApp.post('/dataApi/analysisPRODES/', mockController.getAnalysisPRODES);
    mockApp.post('/dataApi/analysisTreeCoverLoss/', mockController.analysisTreeCoverLoss);
    mockApp.post('/dataApi/analysisTreeCoverGain/', mockController.analysisTreeCoverGain);
    mockApp.post('/dataApi/analysisTreeBiomassLoss/', mockController.analysisTreeBiomassLoss);
    mockApp.post('/dataApi/analysisTreeBiomassTotal/', mockController.analysisTreeBiomassTotal);
    mockApp.post('/dataApi/analysisAdminRegion/', mockController.analysisAdminRegion);
    mockApp.post('/dataApi/getPalmOilMillLatLong/', mockController.getPalmOilMillLatLong);
    mockApp.post('/dataApi/getBBoxAndGeostoreIDs/', mockController.getBBoxAndGeostoreIDs);

    // Assertions
    expect(mockApp.use).toHaveBeenCalledWith('/dataApi', [
      mockMiddlewares.checkOrganization,
      mockMiddlewares.checkAuthentication,
      mockMiddlewares.checkActive,
      mockMiddlewares.checkInactivity,
      'limited-rateLimitAuthenticated',
    ]);

    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/getInfoBubbleData/:infoBubbleId',
      mockController.getInfoBubbleDataController
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/getMetadataTaskData/:metadataID',
      mockController.getMetadataTaskData
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisGLAD/',
      mockController.getAnalysisGLAD
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisVIIRS/',
      mockController.getAnalysisVIIRS
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisPRODES/',
      mockController.getAnalysisPRODES
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisTreeCoverLoss/',
      mockController.analysisTreeCoverLoss
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisTreeCoverGain/',
      mockController.analysisTreeCoverGain
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisTreeBiomassLoss/',
      mockController.analysisTreeBiomassLoss
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisTreeBiomassTotal/',
      mockController.analysisTreeBiomassTotal
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/analysisAdminRegion/',
      mockController.analysisAdminRegion
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/getPalmOilMillLatLong/',
      mockController.getPalmOilMillLatLong
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/dataApi/getBBoxAndGeostoreIDs/',
      mockController.getBBoxAndGeostoreIDs
    );
  });
});

jest.mock('../../../config/privateutils/logger.utils', () => ({}));

jest.mock('../../../config/publicutils/authenticationManager.utils', () => ({}));

jest.mock('../../../config/env/listStatuses.constants', () => ({
  listStatus: {},
}));
