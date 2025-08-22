/**
 * @jest-environment node
 */
// The above overrides 'testEnvironment' setting in jest.config.json to allow nodeJS server environment
// because this code triggers log that requires setImmediate

const axios = require('axios');
jest.mock('axios');

jest.mock('axios-retry', () => jest.fn());

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../../config/publicutils/gfwListManager.utils', () => ({
  getGFWListLocationsGeom: jest.fn(),
}));

import * as controller from '../controllers/dataApi.controller';

const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe('Data API Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInfoBubbleDataController', () => {
    it('should return success response', async () => {
      const req = { params: { infoBubbleId: 'test' } };
      const res = mockRes();
      axios.mockResolvedValueOnce({ data: { data: 'testdata' } });

      controller.getInfoBubbleDataController(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: 'testdata', status: 200 });
    });

    it('should return error response', async () => {
      const req = { params: { infoBubbleId: 'test' } };
      const res = mockRes();
      axios.mockRejectedValueOnce(new Error('API error'));

      controller.getInfoBubbleDataController(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ detail: 'API error', status: 404 }],
      });
    });
  });

  describe('getMetadataTaskData', () => {
    it('should return success response', async () => {
      const req = { params: { metadataID: 'test' } };
      const res = mockRes();
      axios.mockResolvedValueOnce({ data: 'testdata' });

      controller.getMetadataTaskData(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: 'testdata', status: 200 });
    });

    it('should return error response', async () => {
      const req = { params: { metadataID: 'test' } };
      const res = mockRes();
      axios.mockRejectedValueOnce(new Error('API error'));

      controller.getMetadataTaskData(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ detail: 'API error', status: 404 }],
      });
    });
  });

  describe('getAnalysisGLAD', () => {
    it('should return success response', async () => {
      const req = {
        query: {
          geostoreID: 'test',
          group_by: 'date',
          start_date: '2020-01-01',
          end_date: '2020-12-31',
        },
      };
      const res = mockRes();
      axios.mockResolvedValueOnce({ data: { data: [] }, status: 200 });

      controller.getAnalysisGLAD(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [], status: 200 });
    });

    it('should return error response', async () => {
      const req = {
        query: {
          geostoreID: 'test',
          group_by: 'date',
          start_date: '2020-01-01',
          end_date: '2020-12-31',
        },
      };
      const res = mockRes();
      axios.mockRejectedValueOnce({ response: { status: 500 } });

      controller.getAnalysisGLAD(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
    });
  });

  // Add similar tests for getAnalysisVIIRS, getAnalysisPRODES, analysisTreeCoverLoss, analysisTreeCoverGain, analysisTreeBiomassLoss, analysisTreeBiomassTotal, analysisAdminRegion

  describe('getAnalysisVIIRS', () => {
    it('should return success response', async () => {
      const req = { query: { geostoreID: 'test', fireDayStart: '2020-01-01' } };
      const res = mockRes();
      axios.mockResolvedValueOnce({ data: { data: [] }, status: 200 });

      controller.getAnalysisVIIRS(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [], status: 200 });
    });

    it('should return error response', async () => {
      const req = { query: { geostoreID: 'test', fireDayStart: '2020-01-01' } };
      const res = mockRes();
      axios.mockRejectedValueOnce({ message: 'error' });

      controller.getAnalysisVIIRS(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
    });
  });

  describe('getAnalysisPRODES', () => {
    it('should return success response', async () => {
      const req = { query: { geostoreID: 'test', startYear: 2020, endYear: 2021 } };
      const res = mockRes();
      axios.mockResolvedValueOnce({ data: { data: [] }, status: 200 });

      controller.getAnalysisPRODES(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [], status: 200 });
    });

    it('should return error response', async () => {
      const req = { query: { geostoreID: 'test', startYear: 2020, endYear: 2021 } };
      const res = mockRes();
      axios.mockRejectedValueOnce({ message: 'error' });

      controller.getAnalysisPRODES(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
    });
  });

  describe('analysisTreeCoverLoss', () => {
    it('should return success response', async () => {
      const req = {
        query: {
          geostoreID: 'test',
          sum: 'area',
          startYear: 2020,
          endYear: 2021,
          filter: 'density',
          filter_value: 30,
        },
      };
      const res = mockRes();
      axios.mockResolvedValueOnce({ data: { data: [] }, status: 200 });

      controller.analysisTreeCoverLoss(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [], status: 200 });
    });

    it('should return error response', async () => {
      const req = {
        query: {
          geostoreID: 'test',
          sum: 'area',
          startYear: 2020,
          endYear: 2021,
          filter: 'density',
          filter_value: 30,
        },
      };
      const res = mockRes();
      axios.mockRejectedValueOnce({ message: 'error' });

      controller.analysisTreeCoverLoss(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
    });
  });

  describe('analysisTreeCoverGain', () => {
    it('should return success response', async () => {
      const req = { query: { geostoreID: 'test', sum: 'area' } };
      const res = mockRes();
      axios.mockResolvedValueOnce({ data: { data: [] }, status: 200 });

      controller.analysisTreeCoverGain(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [], status: 200 });
    });

    it('should return error response', async () => {
      const req = { query: { geostoreID: 'test', sum: 'area' } };
      const res = mockRes();
      axios.mockRejectedValueOnce({ message: 'error' });

      controller.analysisTreeCoverGain(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
    });
  });

  describe('analysisTreeBiomassLoss', () => {
    it('should return success response', async () => {
      const req = {
        query: {
          geostoreID: 'test',
          sum: 'biomass',
          startYear: 2020,
          endYear: 2021,
          filter: 'density',
          filter_value: 30,
        },
      };
      const res = mockRes();
      axios.mockResolvedValueOnce({ data: { data: [] }, status: 200 });

      controller.analysisTreeBiomassLoss(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [], status: 200 });
    });

    it('should return error response', async () => {
      const req = {
        query: {
          geostoreID: 'test',
          sum: 'biomass',
          startYear: 2020,
          endYear: 2021,
          filter: 'density',
          filter_value: 30,
        },
      };
      const res = mockRes();
      axios.mockRejectedValueOnce({ message: 'error' });

      controller.analysisTreeBiomassLoss(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
    });
  });

  describe('analysisTreeBiomassTotal', () => {
    it('should return success response', async () => {
      const req = { query: { geostoreID: 'test', sum: 'biomass' } };
      const res = mockRes();
      axios.mockResolvedValueOnce({ data: { data: [] }, status: 200 });

      controller.analysisTreeBiomassTotal(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [], status: 200 });
    });

    it('should return error response', async () => {
      const req = { query: { geostoreID: 'test', sum: 'biomass' } };
      const res = mockRes();
      axios.mockRejectedValueOnce({ message: 'error' });

      controller.analysisTreeBiomassTotal(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
    });
  });

  describe('analysisAdminRegion', () => {
    it('should return success response', async () => {
      const req = { query: { admin: 'test', region: 'test', thresh: 0.1 } };
      const res = mockRes();
      axios.mockResolvedValueOnce({ data: { data: 'test' }, status: 200 });

      controller.analysisAdminRegion(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: 'test', status: 200 });
    });

    it('should return error response', async () => {
      const req = { query: { admin: 'test', region: 'test', thresh: 0.1 } };
      const res = mockRes();
      axios.mockRejectedValueOnce({ message: 'error' });

      controller.analysisAdminRegion(req, res);

      await flushPromises();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
    });
  });

  describe('getPalmOilMillLatLong', () => {
    it('should return bad input for empty array', async () => {
      const req = { body: { palmOilMillIDs: [] } };
      const res = mockRes();

      await controller.getPalmOilMillLatLong(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith('Bad input');
    });

    it('should return success for single chunk', async () => {
      const palmOilMillIDs = ['id1', 'id2'];
      const req = { body: { palmOilMillIDs } };
      const res = mockRes();
      axios.mockResolvedValueOnce({
        data: { data: [{ uml_id: 'id1' }, { uml_id: 'id2' }] },
        status: 200,
      });

      await controller.getPalmOilMillLatLong(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: [{ uml_id: 'id1' }, { uml_id: 'id2' }],
        status: 200,
      });
    });

    it('should return error if chunk fails', async () => {
      const palmOilMillIDs = ['id1'];
      const req = { body: { palmOilMillIDs } };
      const res = mockRes();
      axios.mockRejectedValueOnce({ response: { status: 500 }, message: 'error' });

      await controller.getPalmOilMillLatLong(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: 500, detail: 'error' });
    });
  });

  describe('getBBoxAndGeostoreIDs', () => {
    it('should return success response', async () => {
      const req = { body: { listId: 'test', locationIds: ['1'] } };
      const res = mockRes();
      const mockData = { data: 'test' };
      require('../../../config/publicutils/gfwListManager.utils').getGFWListLocationsGeom.mockResolvedValueOnce(
        mockData
      );

      await controller.getBBoxAndGeostoreIDs(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should return error response', async () => {
      const req = { body: { listId: 'test', locationIds: ['1'] } };
      const res = mockRes();
      require('../../../config/publicutils/gfwListManager.utils').getGFWListLocationsGeom.mockRejectedValueOnce(
        { message: 'error', response: { status: 500 } }
      );

      await controller.getBBoxAndGeostoreIDs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
    });
  });
});
