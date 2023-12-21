/**
 * @jest-environment node
 */
const diagnosticsController = require('./diagnosticsListController');
const GFWListManager = require('../../../config/publicutils/gfwListManager.utils');
const ListManager = require('../../../config/publicutils/listManager.utils');
const SharedListManager = require('../../../config/publicutils/shareManager.utils');

// Mock GFWListManager
jest.mock('../../../config/publicutils/gfwListManager.utils', () => ({
  isGfwList: jest.fn(),
  getGFWListsByListId: jest.fn(),
  getAdministrativeAreasDataByLocationId: jest.fn(),
}));

// Mock ListManager
jest.mock('../../../config/publicutils/listManager.utils', () => ({
  getAllLists: jest.fn(),
  getListByIdWithAnalysisId: jest.fn(),
  getAllListsWithAnalysisId: jest.fn(),
}));

// Mock SharedListManager
jest.mock('../../../config/publicutils/shareManager.utils', () => ({
  getUserInternalShareLists: jest.fn(),
  findSharedListsInsideOrganization: jest.fn(),
}));

const logger = require('../../../config/privateutils/logger.utils');
const getAnalysisFromAdministrativeAreasList = require('./gfwListsDiagnosticsFunctions/getAnalysisFromAdministrativeAreasList');
const getAnalysisFromProtectedAreasList = require('./gfwListsDiagnosticsFunctions/getAnalysisFromProtectedAreasList');
const getAnalysisFromGFWList = require('./gfwListsDiagnosticsFunctions/getAnalysisFromGFWList');
const getAnalysisFromUserList = require('./orgListDiagnosticsFunctions/getAnalysisFromUserList');
const setListData = require('../../../config/publicutils/setListData');

// Mock Functions

jest.mock('../../../config/privateutils/logger.utils');
jest.mock('./gfwListsDiagnosticsFunctions/getAnalysisFromAdministrativeAreasList');
jest.mock('./gfwListsDiagnosticsFunctions/getAnalysisFromProtectedAreasList');
jest.mock('./gfwListsDiagnosticsFunctions/getAnalysisFromGFWList');
jest.mock('./orgListDiagnosticsFunctions/getAnalysisFromUserList');
jest.mock('../../../config/publicutils/setListData');

const res = {
  status: jest.fn(() => res),
  send: jest.fn(),
};

beforeEach(() => {
  // Reset mock functions and clear any previous calls
  jest.clearAllMocks();
});

describe('diagnosticsController', () => {
  it('should handle GFW ADMINISTRATIVE_AREAS list with locationId [1544] ', async () => {
    const req = {
      params: {
        listId: '1',
      },
      body: {
        locationId: '1544', // buenos aires, argentina
      },
    };
    // mock isGfwList
    GFWListManager.isGfwList.mockReturnValue(true);

    // mock selected list
    const selectedList = {
      id: 1,
      list_name: 'Administrative Areas',
      list_table_name: 'list-administrativeAreas',
      list_analysis_table_name: 'analysis-administrativeAreas',
      list_status_id: 2,
      list_error_message: null,
      list_locations_count: 49828,
      dashboard_last_submit: null,
      dashboard_last_results: null,
    };
    GFWListManager.getGFWListsByListId.mockResolvedValue(selectedList);

    // mock list analysis data
    const analysisData = {
      spatialData: [],
      listLocationsIds: [1544],
      listAnalysis: [],
      locationAnalyses: [], // missing values
    };
    getAnalysisFromAdministrativeAreasList.mockResolvedValue(analysisData);

    // mock logger call
    logger.info.mockResolvedValue(`POST /diagnostics/${1}`);

    await diagnosticsController(req, res);

    expect(getAnalysisFromAdministrativeAreasList).toHaveBeenCalledWith(req, selectedList);
    expect(logger.info).toHaveBeenCalledWith('POST /diagnostics/1');
    expect(GFWListManager.isGfwList).toHaveBeenCalledWith(1);
    expect(GFWListManager.getGFWListsByListId).toHaveBeenCalledWith(req, 1);
    expect(setListData).toHaveBeenCalled();
  });

  it('should handle GFW PROTECTED_AREAS list with locationId [555637432]', async () => {
    const req = {
      params: {
        listId: '4',
      },
      body: {
        locationId: '555637432', // patagonia, argentina
      },
    };
    // mock isGfwList
    GFWListManager.isGfwList.mockReturnValue(true);

    // mock selected list
    const selectedList = {
      id: 4,
      list_name: 'Protected Areas',
      list_table_name: 'list-protectedAreas',
      list_analysis_table_name: 'analysis-protectedAreas',
      list_status_id: 2,
      list_error_message: null,
      list_locations_count: 275301,
      dashboard_last_submit: null,
      dashboard_last_results: null,
    };
    GFWListManager.getGFWListsByListId.mockResolvedValue(selectedList);

    // mock list analysis data
    const analysisData = {
      spatialData: [],
      listLocationsIds: [555637432],
      listAnalysis: [],
      locationAnalyses: [], // missing values
    };
    getAnalysisFromProtectedAreasList.mockResolvedValue(analysisData);

    // mock logger call
    logger.info.mockResolvedValue(`POST /diagnostics/4`);

    await diagnosticsController(req, res);

    expect(getAnalysisFromProtectedAreasList).toHaveBeenCalledWith(req, selectedList);
    expect(logger.info).toHaveBeenCalledWith('POST /diagnostics/4');
    expect(GFWListManager.isGfwList).toHaveBeenCalledWith(4);
    expect(GFWListManager.getGFWListsByListId).toHaveBeenCalledWith(req, 4);
  });

  it('should handle GFW OIL_PALM_CONCESSIONS list level', async () => {
    const req = {
      params: {
        listId: '2',
      },
      body: {
        locationId: '',
      },
    };
    // mock isGfwList
    GFWListManager.isGfwList.mockReturnValue(true);

    // mock selected list
    const selectedList = {
      id: 2,
      list_name: 'Oil Palm Concessions',
      list_table_name: 'list-oilPalmConcessions',
      list_analysis_table_name: 'analysis-oilPalmConcessions',
      list_status_id: 2,
      list_error_message: null,
      list_locations_count: 2233,
      dashboard_last_submit: '2023-09-12T19:45:22.064Z',
      dashboard_last_results: '2023-09-12T20:01:30.363Z',
    };
    GFWListManager.getGFWListsByListId.mockResolvedValue(selectedList);

    // mock list analysis data
    const analysisData = {
      spatialData: [],
      listLocationsIds: [],
      listAnalysis: [],
      locationAnalyses: [], // missing values
    };
    getAnalysisFromGFWList.mockResolvedValue(analysisData);

    // mock logger call
    logger.info.mockResolvedValue(`POST /diagnostics/2`);

    await diagnosticsController(req, res);

    expect(getAnalysisFromGFWList).toHaveBeenCalledWith(req, selectedList);
    expect(logger.info).toHaveBeenCalledWith('POST /diagnostics/2');
    expect(GFWListManager.isGfwList).toHaveBeenCalledWith(2);
    expect(GFWListManager.getGFWListsByListId).toHaveBeenCalledWith(req, 2);
  });

  it('should handle GFW OIL_PALM_CONCESSIONS list with locationId [117]', async () => {
    const req = {
      params: {
        listId: '2',
      },
      body: {
        locationId: '117',
      },
    };
    // mock isGfwList
    GFWListManager.isGfwList.mockReturnValue(true);

    // mock selected list
    const selectedList = {
      id: 2,
      list_name: 'Oil Palm Concessions',
      list_table_name: 'list-oilPalmConcessions',
      list_analysis_table_name: 'analysis-oilPalmConcessions',
      list_status_id: 2,
      list_error_message: null,
      list_locations_count: 2233,
      dashboard_last_submit: '2023-09-12T19:45:22.064Z',
      dashboard_last_results: '2023-09-12T20:01:30.363Z',
    };
    GFWListManager.getGFWListsByListId.mockResolvedValue(selectedList);

    // mock list analysis data
    const analysisData = {
      spatialData: [],
      listLocationsIds: [],
      listAnalysis: [],
      locationAnalyses: [], // missing values
    };
    getAnalysisFromGFWList.mockResolvedValue(analysisData);

    // mock logger call
    logger.info.mockResolvedValue(`POST /diagnostics/2`);

    await diagnosticsController(req, res);

    expect(getAnalysisFromGFWList).toHaveBeenCalledWith(req, selectedList);
    expect(logger.info).toHaveBeenCalledWith('POST /diagnostics/2');
    expect(GFWListManager.isGfwList).toHaveBeenCalledWith(2);
    expect(GFWListManager.getGFWListsByListId).toHaveBeenCalledWith(req, 2);
  });

  it('should handle GFW PALM_OIL_MILLS list level', async () => {
    const req = {
      params: {
        listId: '3',
      },
      body: {
        locationId: '117',
      },
    };
    // mock isGfwList
    GFWListManager.isGfwList.mockReturnValue(true);

    // mock selected list
    const selectedList = {
      id: 3,
      list_name: 'Oil Palm Concessions',
      list_table_name: 'list-oilPalmConcessions',
      list_analysis_table_name: 'analysis-oilPalmConcessions',
      list_status_id: 2,
      list_error_message: null,
      list_locations_count: 2233,
      dashboard_last_submit: '2023-09-12T19:45:22.064Z',
      dashboard_last_results: '2023-09-12T20:01:30.363Z',
    };
    GFWListManager.getGFWListsByListId.mockResolvedValue(selectedList);

    // mock list analysis data
    const analysisData = {
      spatialData: [],
      listLocationsIds: [],
      listAnalysis: [],
      locationAnalyses: [], // missing values
    };
    getAnalysisFromGFWList.mockResolvedValue(analysisData);

    // mock logger call
    logger.info.mockResolvedValue(`POST /diagnostics/3`);

    await diagnosticsController(req, res);

    expect(getAnalysisFromGFWList).toHaveBeenCalledWith(req, selectedList);
    expect(logger.info).toHaveBeenCalledWith('POST /diagnostics/3');
    expect(GFWListManager.isGfwList).toHaveBeenCalledWith(3);
    expect(GFWListManager.getGFWListsByListId).toHaveBeenCalledWith(req, 3);
  });

  it('should handle GFW PALM_OIL_MILLS list level with locationId [1914]', async () => {
    const req = {
      params: {
        listId: '3',
      },
      body: {
        locationId: '1914',
      },
    };
    // mock isGfwList
    GFWListManager.isGfwList.mockReturnValue(true);

    // mock selected list
    const selectedList = {
      id: 3,
      list_name: 'Oil Palm Concessions',
      list_table_name: 'list-oilPalmConcessions',
      list_analysis_table_name: 'analysis-oilPalmConcessions',
      list_status_id: 2,
      list_error_message: null,
      list_locations_count: 2233,
      dashboard_last_submit: '2023-09-12T19:45:22.064Z',
      dashboard_last_results: '2023-09-12T20:01:30.363Z',
    };
    GFWListManager.getGFWListsByListId.mockResolvedValue(selectedList);

    // mock list analysis data
    const analysisData = {
      spatialData: [],
      listLocationsIds: [],
      listAnalysis: [],
      locationAnalyses: [], // missing values
    };
    getAnalysisFromGFWList.mockResolvedValue(analysisData);

    // mock logger call
    logger.info.mockResolvedValue(`POST /diagnostics/3`);

    await diagnosticsController(req, res);

    expect(getAnalysisFromGFWList).toHaveBeenCalledWith(req, selectedList);
    expect(logger.info).toHaveBeenCalledWith('POST /diagnostics/3');
    expect(GFWListManager.isGfwList).toHaveBeenCalledWith(3);
    expect(GFWListManager.getGFWListsByListId).toHaveBeenCalledWith(req, 3);
  });

  it('should handle GFWPro list [5583] analysis levels for users', async () => {
    const req = {
      params: {
        listId: '5583',
      },
      body: {
        locationId: '',
      },
    };
    const selectedList = {
      id: 5583,
      user_id: 10033,
      template_id: 13,
      list_name: 'Recent Cocoa Generic 202309302238',
      list_table_name: 'list-recentcocoageneric202309302238',
      list_analysis_table_name: 'analysis-recentcocoageneric202309302238',
      list_status_id: 2,
      list_error_message: null,
      location_classification: 'supply shed',
      custom_attribute_names: '',
      custom_attribute_types: '',
      list_locations_count: 998,
      lock_status: null,
      lock_user_id: null,
      associated_gfwlist: null,
      dashboard_last_submit: '2023-10-31T21:31:08.152Z',
      dashboard_last_results: '2023-10-31T21:41:42.311Z',
      vector_tiles_storage_path:
        'gfwpro-site-data/mbtiles/development/20231211_222552_998_5583_c7194e1f_8afb_4175_a11b_d07533b3f8c8.mbtiles',
      error_file_storage_path: null,
      vector_tiles_last_updated: '2023-12-12T02:25:54.416Z',
      large_list_id: null,
      listAnalysesStatus: [
        {
          listId: 5583,
          analysisId: 'ALERTS',
          status: 2,
          errorInfo: '',
          updateTime: '2023-10-31T21:41:41.587Z',
        },
        {
          listId: 5583,
          analysisId: 'FCD',
          status: 2,
          errorInfo: '',
          updateTime: '2023-10-31T21:37:20.076Z',
        },
        {
          listId: 5583,
          analysisId: 'AFI',
          status: 2,
          errorInfo: '',
          updateTime: '2023-10-31T21:36:59.017Z',
        },
      ],
    };
    GFWListManager.isGfwList.mockReturnValue(false);
    ListManager.getListByIdWithAnalysisId.mockResolvedValue(selectedList);

    await diagnosticsController(req, res);

    expect(logger.info).toHaveBeenCalledWith('POST /diagnostics/5583');
    expect(GFWListManager.isGfwList).toHaveBeenCalledWith(5583);
    expect(ListManager.getListByIdWithAnalysisId).toHaveBeenCalledWith(req, 5583);
    expect(getAnalysisFromUserList).toHaveBeenCalledWith(req, selectedList);
  });

  it('should handle GFWPro list [5583] analysis levels for users with locationId [678]', async () => {
    const req = {
      params: {
        listId: '5583',
      },
      body: {
        locationId: '678',
      },
    };
    const selectedList = {
      id: 5583,
      user_id: 10033,
      template_id: 13,
      list_name: 'Recent Cocoa Generic 202309302238',
      list_table_name: 'list-recentcocoageneric202309302238',
      list_analysis_table_name: 'analysis-recentcocoageneric202309302238',
      list_status_id: 2,
      list_error_message: null,
      location_classification: 'supply shed',
      custom_attribute_names: '',
      custom_attribute_types: '',
      list_locations_count: 998,
      lock_status: null,
      lock_user_id: null,
      associated_gfwlist: null,
      dashboard_last_submit: '2023-10-31T21:31:08.152Z',
      dashboard_last_results: '2023-10-31T21:41:42.311Z',
      vector_tiles_storage_path:
        'gfwpro-site-data/mbtiles/development/20231211_222552_998_5583_c7194e1f_8afb_4175_a11b_d07533b3f8c8.mbtiles',
      error_file_storage_path: null,
      vector_tiles_last_updated: '2023-12-12T02:25:54.416Z',
      large_list_id: null,
      listAnalysesStatus: [
        {
          listId: 5583,
          analysisId: 'ALERTS',
          status: 2,
          errorInfo: '',
          updateTime: '2023-10-31T21:41:41.587Z',
        },
        {
          listId: 5583,
          analysisId: 'FCD',
          status: 2,
          errorInfo: '',
          updateTime: '2023-10-31T21:37:20.076Z',
        },
        {
          listId: 5583,
          analysisId: 'AFI',
          status: 2,
          errorInfo: '',
          updateTime: '2023-10-31T21:36:59.017Z',
        },
      ],
    };
    GFWListManager.isGfwList.mockReturnValue(false);
    ListManager.getListByIdWithAnalysisId.mockResolvedValue(selectedList);

    await diagnosticsController(req, res);

    expect(logger.info).toHaveBeenCalledWith('POST /diagnostics/5583');
    expect(GFWListManager.isGfwList).toHaveBeenCalledWith(5583);
    expect(ListManager.getListByIdWithAnalysisId).toHaveBeenCalledWith(req, 5583);
    expect(getAnalysisFromUserList).toHaveBeenCalledWith(req, selectedList);
  });

  it('should handle GFWPro shared list [5730] analysis levels', async () => {
    const req = {
      params: {
        listId: '5730',
      },
      body: {
        locationId: '678',
        isSharedList: true,
      },
      session: {
        organization_user_id: 10033,
      },
    };
    const selectedList = {
      id: 5730,
      user_id: 10048,
      template_id: 13,
      list_name: 'kgArg3 testcopy',
      list_table_name: 'list-kgarg3testcopy',
      list_analysis_table_name: 'analysis-kgarg3testcopy',
      list_status_id: 2,
      list_error_message: null,
      location_classification: 'Property',
      custom_attribute_names: '',
      custom_attribute_types: '',
      list_locations_count: 3,
      lock_status: null,
      lock_user_id: null,
      associated_gfwlist: null,
      dashboard_last_submit: null,
      dashboard_last_results: null,
      vector_tiles_storage_path:
        'gfwpro-site-data/mbtiles/development/20231102_090503_3_5730_2feb674c_7770_42ab_9ef5_bde9be41b9e0.mbtiles',
      error_file_storage_path: null,
      vector_tiles_last_updated: '2023-11-02T16:05:04.436Z',
      large_list_id: null,
      listAnalysesStatus: [
        {
          listId: 5730,
          analysisId: 'FCD',
          status: 2,
          errorInfo: '',
          updateTime: '2023-11-02T16:10:36.352Z',
        },
      ],
    };
    GFWListManager.isGfwList.mockReturnValue(false);
    ListManager.getAllListsWithAnalysisId.mockResolvedValue([]);
    SharedListManager.getUserInternalShareLists.mockResolvedValue([]);
    getAnalysisFromUserList.mockResolvedValue(req, selectedList);

    await diagnosticsController(req, res);

    expect(logger.info).toHaveBeenCalledWith('POST /diagnostics/5730');
    expect(GFWListManager.isGfwList).toHaveBeenCalledWith(5730);
    expect(ListManager.getAllListsWithAnalysisId).toHaveBeenCalledWith(req);
    expect(SharedListManager.findSharedListsInsideOrganization).toHaveBeenCalledWith([], []);
    expect(SharedListManager.getUserInternalShareLists).toHaveBeenCalledWith(
      req,
      req.session.organization_user_id
    );
    // expect(getAnalysisFromUserList).toHaveBeenCalledWith(req, selectedList);
  });

  it('should handle errors for Gfwlist analysis [1]', async () => {
    const req = {
      params: {
        listId: '1',
      },
      body: {
        locationId: '',
      },
    };
    GFWListManager.isGfwList.mockReturnValue(true);
    GFWListManager.getGFWListsByListId.mockRejectedValue(new Error('Mocked error'));

    await diagnosticsController(req, res);

    expect(logger.error).toHaveBeenCalledWith('POST /diagnostics/1', expect.any(Error));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle errors for Gwfpro Lists analysis [5583]', async () => {
    const req = {
      params: {
        listId: '5583',
      },
      body: {
        locationId: '',
        isSharedList: 'false',
      },
    };
    GFWListManager.isGfwList.mockReturnValue(false);
    ListManager.getListByIdWithAnalysisId.mockRejectedValue(new Error('Mocked error'));

    await diagnosticsController(req, res);

    expect(logger.error).toHaveBeenCalledWith('POST /diagnostics/5583', expect.any(Error));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.any(Error));
  });
});
