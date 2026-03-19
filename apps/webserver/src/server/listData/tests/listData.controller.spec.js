const axios = require('axios');

jest.mock('../../../config/publicutils/listManager.utils', () => ({
  getListLocationsNoGeom: jest.fn(),
  getPaginatedAnalysisDataForUserList: jest.fn(),
}));

jest.mock('../../../config/publicutils/locationManager.utils', () => ({
  getLocationAttributesList: jest.fn(),
}));

jest.mock('../../../config/publicutils/analysisManager.utils', () => ({
  getListAnalyses: jest.fn(),
  getAnalysisDataForUserList: jest.fn(),
}));

jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../utils/listData.utils', () => ({
  getListDataFiltered: jest.fn((data) => data),
}));

jest.mock('axios');

jest.mock('../../../config/privateutils/list.utils', () => ({
  getListNameSchema: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@wri-monorepos/constants', () => ({
  analysisTypes: { Loss: 'Loss', Density: 'Density' },
  listStatus: { Draft: 'Draft', Pending: 'Pending' },
  AlertsAnalysisFrequency: { WEEKLY: 'Weekly' },
}));

jest.mock('@wri-monorepos/geo', () => ({
  getListAnalysisStatusByListId: jest.fn(),
  setSelectedAnalyses: jest.fn(),
}));

jest.mock('@wri-monorepos/shared', () => ({
  featureFlagsService: jest.fn().mockResolvedValue({
    getClientIdByClientStoreDatabaseName: jest.fn().mockResolvedValue(1),
    getFeatureFlagsForCurrentOrg: jest
      .fn()
      .mockResolvedValue([{ flagId: 'WeeklyAlerts', flagState: true }]),
  }),
  retryWithDelay: (fn) => fn(),
  isRetryableError: jest.fn().mockReturnValue(false),
}));

jest.mock('../../geoTrellis/controllers/geoTrellis.controller', () => ({
  geoTrellisAnalyzeListController: jest.fn(),
}));

const ListManager = require('../../../config/publicutils/listManager.utils');
const LocationManager = require('../../../config/publicutils/locationManager.utils');
const AnalysisManager = require('../../../config/publicutils/analysisManager.utils');
const listUtils = require('../../../config/privateutils/list.utils');
const { getListDataFiltered } = require('../utils/listData.utils');
const { analysisTypes, listStatus } = require('@wri-monorepos/constants');
const { getListAnalysisStatusByListId, setSelectedAnalyses } = require('@wri-monorepos/geo');
const {
  geoTrellisAnalyzeListController,
} = require('../../geoTrellis/controllers/geoTrellis.controller');

const {
  listData,
  listDataCustom,
  getSelectedAnalyses,
  setSelectedAnalysesCtrl,
  getListCommodity,
  getListByCommodity,
  getPreviewData,
} = require('../controllers/listData.controller');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('listData.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LISTS_MICROSERVICE_URL = 'https://lists.example.com';
  });

  describe('listData', () => {
    it('returns filtered list data for a valid listID', async () => {
      const req = { query: { list_id: 'abc', page: 0, pageSize: 2 } };
      const res = createRes();

      AnalysisManager.getListAnalyses.mockResolvedValue([{ id: 1 }]);
      ListManager.getListLocationsNoGeom.mockResolvedValue([{ location_id: 1 }]);
      LocationManager.getLocationAttributesList.mockResolvedValue([{ location_id: 1 }]);
      AnalysisManager.getAnalysisDataForUserList.mockResolvedValue([{ analysis: true }]);
      getListDataFiltered.mockReturnValue({ ok: true });

      await listData(req, res);

      expect(AnalysisManager.getListAnalyses).toHaveBeenCalledWith(req, 'abc');
      expect(getListDataFiltered).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    it('handles errors and returns 422', async () => {
      const req = { query: { list_id: 'abc' } };
      const res = createRes();
      AnalysisManager.getListAnalyses.mockRejectedValue(new Error('boom'));

      await listData(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('listDataCustom', () => {
    it('returns custom columns and includes list_id', async () => {
      const req = {
        body: {
          list_ids: ['l1'],
          columnsToReturn: 'Latitude,Longitude,location_id,foo',
          filters: { selectedCountry: 'BR', selectedState: '', selectedSubState: '' },
        },
      };
      const res = createRes();

      ListManager.getPaginatedAnalysisDataForUserList.mockResolvedValue([
        { list_id: 'l1', Latitude: 1, Longitude: 2, location_id: 3, foo: 'bar', drop: true },
      ]);

      await listDataCustom(req, res);

      expect(ListManager.getPaginatedAnalysisDataForUserList).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { list_id: 'l1', Latitude: 1, Longitude: 2, location_id: 3, foo: 'bar' },
      ]);
    });

    it('returns 422 on error', async () => {
      const req = { body: { list_ids: ['l1'], columnsToReturn: 'location_id', filters: {} } };
      const res = createRes();
      ListManager.getPaginatedAnalysisDataForUserList.mockRejectedValue(new Error('nope'));

      await listDataCustom(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('getSelectedAnalyses', () => {
    it('returns selected analyses', async () => {
      getListAnalysisStatusByListId.mockResolvedValue({ items: [1, 2] });
      const req = { params: { listId: '42' }, session: { organization_database: 'org' } };
      const res = createRes();

      await getSelectedAnalyses(req, res);

      expect(getListAnalysisStatusByListId).toHaveBeenCalledWith('org', '42');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ items: [1, 2] });
    });

    it('returns 400 on error', async () => {
      getListAnalysisStatusByListId.mockRejectedValue(new Error('bad'));
      const req = { params: { listId: '42' }, session: { organization_database: 'org' } };
      const res = createRes();

      await getSelectedAnalyses(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'listId is not valid' });
    });
  });

  describe('setSelectedAnalysesCtrl', () => {
    let req, res;

    beforeEach(() => {
      req = {
        params: { listId: '1' },
        body: {},
        session: { organization_database: 'org' },
      };
      res = createRes();
      setSelectedAnalyses.mockClear();
      geoTrellisAnalyzeListController.mockClear();
      listUtils.getListNameSchema.mockClear();
    });

    it('validates missing analysisIds when not saveAsDraft', async () => {
      req.body = {};
      await setSelectedAnalysesCtrl(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'analysisIds is required' });
    });

    it('validates invalid analysisIds', async () => {
      req.body = { selectedAnalysis: ['Invalid'], saveAsDraft: false };
      await setSelectedAnalysesCtrl(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'analysisIds is not valid' });
    });

    it('creates selection as draft', async () => {
      req.body = { selectedAnalysis: [], saveAsDraft: true };
      await setSelectedAnalysesCtrl(req, res);
      expect(setSelectedAnalyses).toHaveBeenCalledWith('org', '1', [], listStatus.Draft, 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'List analysis selection created successfully',
      });
    });

    it('creates selection as pending', async () => {
      req.body = { selectedAnalysis: [analysisTypes.Loss], saveAsDraft: false };
      await setSelectedAnalysesCtrl(req, res);
      expect(setSelectedAnalyses).toHaveBeenCalledWith(
        'org',
        '1',
        [analysisTypes.Loss],
        listStatus.Pending,
        1
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'List analysis selection created successfully',
      });
    });

    it('delegates to geoTrellisAnalyzeListController when isAddingAnalysis is true and newAnalysesToRun is provided', async () => {
      req.body = {
        selectedAnalysis: [analysisTypes.Loss, analysisTypes.Density],
        saveAsDraft: false,
        isAddingAnalysis: true,
        newAnalysesToRun: [analysisTypes.Loss],
      };
      listUtils.getListNameSchema.mockResolvedValue({ id: '1', list_name: 'Test List' });
      geoTrellisAnalyzeListController.mockResolvedValue(undefined);

      await setSelectedAnalysesCtrl(req, res);

      expect(setSelectedAnalyses).toHaveBeenCalledWith(
        'org',
        '1',
        [analysisTypes.Loss, analysisTypes.Density],
        listStatus.Pending,
        1
      );
      expect(listUtils.getListNameSchema).toHaveBeenCalledWith(req, '1');
      expect(geoTrellisAnalyzeListController).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            list: expect.objectContaining({ id: '1', list_name: 'Test List' }),
            analysisTypes: analysisTypes.Loss,
            reanalyze: true,
          }),
        }),
        res
      );
    });

    it('returns 201 and does not call geoTrellisAnalyzeListController if newAnalysesToRun is empty', async () => {
      req.body = {
        selectedAnalysis: [analysisTypes.Loss],
        saveAsDraft: false,
        isAddingAnalysis: true,
        newAnalysesToRun: [],
      };
      await setSelectedAnalysesCtrl(req, res);
      expect(setSelectedAnalyses).toHaveBeenCalledWith(
        'org',
        '1',
        [analysisTypes.Loss],
        listStatus.Pending,
        1
      );
      expect(geoTrellisAnalyzeListController).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'List analysis selection created successfully',
      });
    });

    it('handles error and returns 400', async () => {
      req.body = { selectedAnalysis: [analysisTypes.Loss] };
      setSelectedAnalyses.mockRejectedValue(new Error('fail'));
      await setSelectedAnalysesCtrl(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'create list analysis failed' });
    });
  });

  describe('getListCommodity', () => {
    it('proxies commodity request', async () => {
      const req = { params: { listId: '9' }, session: { organization_database: 'org' } };
      const res = createRes();
      axios.get.mockResolvedValue({ data: { ok: true } });

      await getListCommodity(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://lists.example.com/commodity/by-list?listId=9&organizationDatabase=org'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns 500 on error', async () => {
      const req = { params: { listId: '9' }, session: { organization_database: 'org' } };
      const res = createRes();
      axios.get.mockRejectedValue(new Error('down'));

      await getListCommodity(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getListByCommodity', () => {
    it('validates required commodity', async () => {
      const req = { query: {}, session: { organization_database: 'org' } };
      const res = createRes();
      await getListByCommodity(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'commodity is required' });
    });

    it('proxies list by commodity', async () => {
      const req = { query: { commodity: 'cocoa' }, session: { organization_database: 'org' } };
      const res = createRes();
      axios.get.mockResolvedValue({ data: { items: [] } });

      await getListByCommodity(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://lists.example.com/commodity/all-lists?commodity=cocoa&organizationDatabase=org'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ items: [] });
    });
  });

  describe('getPreviewData', () => {
    it('posts preview request and returns data', async () => {
      const req = { query: { path: '/tmp/file.csv' } };
      const res = createRes();
      axios.post.mockResolvedValue({ data: { preview: true } });

      await getPreviewData(req, res);

      expect(axios.post).toHaveBeenCalledWith(
        'https://lists.example.com/list/upload/preview',
        { path: '/tmp/file.csv' },
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ preview: true });
    });

    it('returns error status and message from response', async () => {
      const req = { query: { path: '/tmp/file.csv' } };
      const res = createRes();
      axios.post.mockRejectedValue({ response: { status: 409, data: { message: 'bad' } } });

      await getPreviewData(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'bad' });
    });

    it('defaults to 400 when no error response', async () => {
      const req = { query: { path: '/tmp/file.csv' } };
      const res = createRes();
      axios.post.mockRejectedValue(new Error('oops'));

      await getPreviewData(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch preview data' });
    });
  });
});
