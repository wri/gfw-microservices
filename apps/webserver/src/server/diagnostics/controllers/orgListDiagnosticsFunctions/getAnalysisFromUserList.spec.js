/**
 * @jest-environment node
 */
const getAnalysisFromUserList = require('./getAnalysisFromUserList');
const ListManager = require('../../../../config/publicutils/listManager.utils');
const AnalysisManager = require('../../../../config/publicutils/analysisManager.utils');
const LocationManager = require('../../../../config/publicutils/locationManager.utils');
const _ = require('lodash');

// Mock ListManager
jest.mock('../../../../config/publicutils/listManager.utils', () => ({
  getListLocations: jest.fn(),
  getPaginatedAnalysisDataForUserList: jest.fn(),
}));

// Mock AnalysisManager
jest.mock('../../../../config/publicutils/analysisManager.utils', () => ({
  getListAnalyses: jest.fn(),
}));

// Mock LocationManager
jest.mock('../../../../config/publicutils/locationManager.utils', () => ({
  getLocationAttributesList: jest.fn(),
}));

jest.mock('lodash', {
  pick: jest.fn(),
});

describe('getAnalysisFromUserList', () => {
  let selectedList;

  beforeEach(() => {
    selectedList = {
      id: 5583,
      user_id: 10033,
      list_locations_count: 998,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.only('should handle locationId and call ListManager.getListLocations', async () => {
    let req = {
      body: {
        locationId: '678',
      },
      params: {
        listId: '5583',
      },
    };

    ListManager.getListLocations.mockResolvedValue(undefined);
    AnalysisManager.getListAnalyses.mockRejectedValue([]);
    ListManager.getPaginatedAnalysisDataForUserList.mockRejectedValue([]);

    const result = await getAnalysisFromUserList(req, selectedList);

    expect(getAnalysisFromUserList).toThrow(Error);

    const SINGLE_LOCATION_ROW_REQUESTED = 1;
    expect(ListManager.getListLocations).toHaveBeenCalledWith(
      req,
      req.params.listId,
      req.body.locationId,
      SINGLE_LOCATION_ROW_REQUESTED
    );
    expect(AnalysisManager.getListAnalyses).toHaveBeenLastCalledWith(req, req.params.listId);
    expect(ListManager.getPaginatedAnalysisDataForUserList).toHaveBeenLastCalledWith(
      req,
      req.params.listId,
      {
        page: 1,
        pageSize: selectedList.list_locations_count,
        orderType: 'desc',
        sortByAttribute: 'Investment Name',
        searchString: '',
      }
    );
    expect(_.pick).toHaveBeenCalled();
    expect(result.spatialData).toEqual(expect.any(Array));
    expect(result.listLocationsIds).toEqual(expect.any(Array));
    expect(result.listAnalyses).toEqual(expect.any(Array));
    expect(result.locationAnalyses).toEqual(expect.any(Array));
  });

  it('should handle no locationId and call ListManager.getPaginatedAnalysisDataForUserList', async () => {
    ListManager.getPaginatedAnalysisDataForUserList.mockResolvedValue({});

    const result = await getAnalysisFromUserList(req, selectedList);

    expect(ListManager.getPaginatedAnalysisDataForUserList).toHaveBeenCalledWith(
      req,
      1,
      expect.any(Object)
    );
    expect(LocationManager.getLocationAttributesList).toHaveBeenCalledWith(
      req,
      expect.any(Array),
      false
    );
    expect(result.spatialData).toEqual(expect.any(Array));
    expect(result.listLocationsIds).toEqual(expect.any(Array));
    expect(result.listAnalyses).toEqual(expect.any(Array));
    expect(result.locationAnalyses).toEqual(expect.any(Array));
  });

  it('should handle no analysis data', async () => {
    ListManager.getPaginatedAnalysisDataForUserList.mockResolvedValue({});
    const result = await getAnalysisFromUserList(req, selectedList);

    expect(result.spatialData).toEqual(expect.any(Array));
    expect(result.listLocationsIds).toEqual(expect.any(Array));
    expect(result.listAnalyses).toEqual(expect.any(Array));
    expect(result.locationAnalyses).toEqual(expect.any(Array));
  });

  it('should handle errors and return the error', async () => {
    const errorMessage = 'Some error message';
    ListManager.getListLocations.mockRejectedValue(new Error(errorMessage));

    const result = await getAnalysisFromUserList(req, selectedList);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toEqual(errorMessage);
  });
});
