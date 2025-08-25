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

// The controller resolves this via path.resolve('./config/privateutils/list.utils'),
// which in Jest resolves to the monorepo root. Provide a virtual mock for that absolute path.
jest.mock('path', () => ({
  resolve: () => '../../../config/privateutils/list.utils',
}));

jest.mock('@wri-monorepos/constants', () => ({
  analysisTypes: { Loss: 'Loss', Density: 'Density' },
  listStatus: { Draft: 'Draft', Pending: 'Pending' },
}));

jest.mock('@wri-monorepos/geo', () => ({
  getListAnalysisStatusByListId: jest.fn(),
  setSelectedAnalyses: jest.fn(),
}));

const ListManager = require('../../../config/publicutils/listManager.utils');
const LocationManager = require('../../../config/publicutils/locationManager.utils');
const AnalysisManager = require('../../../config/publicutils/analysisManager.utils');
const listUtils = require('../../../config/privateutils/list.utils');
const { getListDataFiltered } = require('../utils/listData.utils');
const { analysisTypes, listStatus } = require('@wri-monorepos/constants');
const { getListAnalysisStatusByListId, setSelectedAnalyses } = require('@wri-monorepos/geo');

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

      expect(listUtils.getListNameSchema).toHaveBeenCalledWith(req, '42');
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
    it('validates missing analysisIds when not saveAsDraft', async () => {
      const req = { params: { listId: '1' }, body: {}, session: { organization_database: 'org' } };
      const res = createRes();
      await setSelectedAnalysesCtrl(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'analysisIds is required' });
    });

    it('validates invalid analysisIds', async () => {
      const req = {
        params: { listId: '1' },
        body: { analysisIds: ['Invalid'], saveAsDraft: false },
        session: { organization_database: 'org' },
      };
      const res = createRes();
      await setSelectedAnalysesCtrl(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'analysisIds is not valid' });
    });

    it('creates selection as draft', async () => {
      const req = {
        params: { listId: '1' },
        body: { analysisIds: [], saveAsDraft: true },
        session: { organization_database: 'org' },
      };
      const res = createRes();
      await setSelectedAnalysesCtrl(req, res);
      expect(setSelectedAnalyses).toHaveBeenCalledWith('org', '1', [], listStatus.Draft);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('creates selection as pending', async () => {
      const req = {
        params: { listId: '1' },
        body: { analysisIds: [analysisTypes.Loss], saveAsDraft: false },
        session: { organization_database: 'org' },
      };
      const res = createRes();
      await setSelectedAnalysesCtrl(req, res);
      expect(setSelectedAnalyses).toHaveBeenCalledWith(
        'org',
        '1',
        [analysisTypes.Loss],
        listStatus.Pending
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('handles error and returns 400', async () => {
      const req = {
        params: { listId: '1' },
        body: { analysisIds: [analysisTypes.Loss] },
        session: { organization_database: 'org' },
      };
      const res = createRes();
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
