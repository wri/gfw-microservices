/**
 * @jest-environment node
 */

// Mock dependencies BEFORE importing the module under test
jest.mock('mssql');

// Create the mocks for constants
const mockListStatus = {
  Pending: 1,
  Active: 2,
  Inactive: 3,
  Draft: 4,
  AnalyzingDiagnostic: 5,
  AnalyzingDashboard: 6,
};

const mockListStatusOrderByWorse = [
  mockListStatus.Draft,
  mockListStatus.Inactive,
  mockListStatus.Pending,
  mockListStatus.AnalyzingDiagnostic,
  mockListStatus.AnalyzingDashboard,
  mockListStatus.Active,
];

// Don't mock path - let it work normally
jest.mock('../config', () => ({
  platformVars: {
    accessLevel: {
      Administrator: 1,
      Editor: 2,
      Viewer: 3,
    },
  },
}));
jest.mock('../config/locations.config', () => ({
  DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED: 100,
}));
jest.mock('../privateutils/sql.utils', () => ({
  executeOrganizationStoredProcedure: jest.fn(),
  executeSystemStoredProcedure: jest.fn(),
}));
jest.mock('../privateutils/logger.utils', () => ({
  logActivity: jest.fn(),
  error: jest.fn(),
  listActivityTypes: {
    List: {
      ListCreated: 'ListCreated',
      ListUpdate: 'ListUpdate',
      ListUpdateNew: 'ListUpdateNew',
      LocationDeletedFromList: 'LocationDeletedFromList',
      LocationUpdatedInList: 'LocationUpdatedInList',
      LocationCopiedToList: 'LocationCopiedToList',
      LocationMovedFromList: 'LocationMovedFromList',
      ListDeleted: 'ListDeleted',
      ListAnalyzing: 'ListAnalyzing',
    },
  },
}));
jest.mock('../privateutils/error.utils', () => ({
  createErrorMessage: jest.fn(),
  ERROR_CODES: {
    failedToGetList: 'FAILED_TO_GET_LIST',
    failedToGetLocationsCount: 'FAILED_TO_GET_LOCATIONS_COUNT',
    failedToGetLockStatus: 'FAILED_TO_GET_LOCK_STATUS',
    failedToDeleteList: 'FAILED_TO_DELETE_LIST',
  },
}));
jest.mock('../privateutils/list.utils', () => ({
  getListNameSchema: jest.fn(),
  createListNameSchema: jest.fn(),
  uploadBulkLocations: jest.fn(),
  deleteSingleLocation: jest.fn(),
  editSingleLocation: jest.fn(),
  copySingleLocation: jest.fn(),
  getListJsonAttributesColumnsSqlParam: jest.fn(),
}));
jest.mock('../privateutils/analysis.utils');
jest.mock('../privateutils/rollback.utils');
jest.mock('../privateutils/location.utils', () => ({
  createGeoJSON: jest.fn(),
  copyLocationWithinOrganization: jest.fn(),
}));
// Mock the actual file path relative to this test file
jest.mock('../env/listStatuses.constants', () => ({
  listStatusOrderByWorse: mockListStatusOrderByWorse,
}));
jest.mock('@wri-monorepos/constants', () => ({
  listStatus: mockListStatus,
}));
jest.mock('@wri-monorepos/sql', () => ({
  getAllLists: 'uspGetAllLists',
  getUserLists: 'uspGetUserLists',
  DeleteListTypeOrm: jest.fn(),
  getListJsonAttributesColumnsSqlParam: jest.fn(),
}));
jest.mock('@wri-monorepos/geo', () => ({
  setSelectedAnalyses: jest.fn(),
}));

const {
  getWorstStatusId,
  setWorstStatusId,
  mergeListsWithAnalysisId,
  getUserLists,
  getUserListsWithAnalysisId,
  getAllLists,
  getAllListsWithAnalysisId,
  rerunExistingList,
  getListLockStatus,
  setListLocked,
  setListUnlocked,
  resetListStatus,
  getListStatusCommonName,
  getListLocations,
  getSimplifiedListLocations,
  getListLocationsNoGeom,
  getPaginatedAnalysisDataForUserList,
  getNumberPagesForAnalysisDataUserList,
  checkListLockStatus,
  getLocationsCount,
  copyLocations,
  moveLocations,
  deleteLocations,
  editLocations,
  updateIndividualLocationsStatusID,
  uploadToExistingList,
  getListLocationGeometry,
  deleteListIfEmpty,
  getListAdminAreasOrderedByCountry,
  deleteList,
} = require('./listManager.utils');

const sqlUtils = require('../privateutils/sql.utils');
const errorUtils = require('../privateutils/error.utils');

describe('Test getWorstStatusId function', () => {
  test('When it is empty should return undefined', () => {
    const code = getWorstStatusId([]);
    expect(code).toBe(undefined);
  });

  test('When it is null should return undefined', () => {
    const code = getWorstStatusId(null);
    expect(code).toBe(undefined);
  });

  test('When receiving 1 and 2 it should return 1 as the worst status', () => {
    const code = getWorstStatusId([
      {
        status: 1,
      },
      { status: 2 },
    ]);
    expect(code).toBe(1);
  });

  test('When receiving 1 and 4 it should return 4 as the worst status', () => {
    const code = getWorstStatusId([
      {
        status: 1,
      },
      { status: 4 },
    ]);
    expect(code).toBe(4);
  });

  test('when both analyzes have the same status, this value must be the same as the list status.', () => {
    const code = getWorstStatusId([
      {
        status: 2,
      },
      { status: 2 },
    ]);
    expect(code).toBe(2);
  });

  test('When receiving multiple statuses, should return the worst one (4 is worst)', () => {
    const code = getWorstStatusId([
      { status: 2 }, // Active
      { status: 1 }, // Pending
      { status: 4 }, // Draft (worst)
      { status: 6 }, // AnalyzingDashboard
    ]);
    expect(code).toBe(4);
  });

  test('When receiving string JSON, should parse and return worst status', () => {
    const code = getWorstStatusId(JSON.stringify([{ status: 1 }, { status: 4 }]));
    expect(code).toBe(4);
  });

  test('When receiving all status types, should return Draft (4) as worst', () => {
    const code = getWorstStatusId([
      { status: 1 }, // Pending
      { status: 2 }, // Active
      { status: 3 }, // Inactive
      { status: 4 }, // Draft
      { status: 5 }, // AnalyzingDiagnostic
      { status: 6 }, // AnalyzingDashboard
    ]);
    expect(code).toBe(4);
  });
});

describe('Test setWorstStatusId function', () => {
  test('When list has no listAnalysesStatus, it should keep its original status', () => {
    const lists = [
      {
        list_status_id: 2,
        listAnalysesStatus: JSON.stringify([]),
      },
    ];
    setWorstStatusId(lists);
    expect(lists[0].list_status_id).toBe(2);
  });

  test('When list has listAnalysesStatus with same status, it should keep that status', () => {
    const lists = [
      {
        list_status_id: 2,
        listAnalysesStatus: JSON.stringify([{ status: 2 }, { status: 2 }]),
      },
    ];
    setWorstStatusId(lists);
    expect(lists[0].list_status_id).toBe(2);
  });

  test('When list has listAnalysesStatus with different statuses, it should update to worst', () => {
    const lists = [
      {
        list_status_id: 2,
        listAnalysesStatus: JSON.stringify([{ status: 2 }, { status: 4 }]),
      },
    ];
    setWorstStatusId(lists);
    expect(lists[0].list_status_id).toBe(4);
  });

  test('When list has null listAnalysesStatus, it should keep its original status', () => {
    const lists = [
      {
        list_status_id: 2,
        listAnalysesStatus: null,
      },
    ];
    setWorstStatusId(lists);
    expect(lists[0].list_status_id).toBe(2);
  });

  test('When processing multiple lists, each should get correct worst status', () => {
    const lists = [
      {
        list_status_id: 2,
        listAnalysesStatus: JSON.stringify([{ status: 1 }, { status: 4 }]),
      },
      {
        list_status_id: 1,
        listAnalysesStatus: JSON.stringify([{ status: 2 }, { status: 2 }]),
      },
      {
        list_status_id: 5,
        listAnalysesStatus: JSON.stringify([]),
      },
    ];
    setWorstStatusId(lists);
    expect(lists[0].list_status_id).toBe(4); // Updated to worst
    expect(lists[1].list_status_id).toBe(2); // Updated to all same
    expect(lists[2].list_status_id).toBe(5); // No change
  });

  test('When listAnalysesStatus is string "null", should keep status', () => {
    const lists = [
      {
        list_status_id: 3,
        listAnalysesStatus: 'null',
      },
    ];
    setWorstStatusId(lists);
    expect(lists[0].list_status_id).toBe(3);
  });
});

describe('Test getUserLists function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        ispromanager: false,
        user_access_level_id: 3, // Not administrator
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should call getUserLists stored procedure for regular user', async () => {
    const mockLists = [
      { id: 1, list_name: 'Test List 1' },
      { id: 2, list_name: 'Test List 2' },
    ];
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockLists);

    const result = await getUserLists(mockReq);

    expect(result).toEqual(mockLists);
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetUserLists',
      expect.arrayContaining([
        expect.objectContaining({ field: 'list_id', value: null }),
        expect.objectContaining({ field: 'user_id', value: 123 }),
      ])
    );
  });

  test('Should call getAllLists stored procedure for super admin', async () => {
    mockReq.session.ispromanager = true;
    const mockLists = [
      { id: 1, list_name: 'Test List 1' },
      { id: 2, list_name: 'Test List 2' },
      { id: 3, list_name: 'Test List 3' },
    ];
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockLists);

    const result = await getUserLists(mockReq);

    expect(result).toEqual(mockLists);
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetAllLists',
      expect.arrayContaining([expect.objectContaining({ field: 'list_id', value: null })])
    );
  });

  test('Should call getAllLists stored procedure for organization admin', async () => {
    mockReq.session.user_access_level_id = 1; // Administrator
    const mockLists = [{ id: 1, list_name: 'Test List 1' }];
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockLists);

    const result = await getUserLists(mockReq);

    expect(result).toEqual(mockLists);
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetAllLists',
      expect.any(Array)
    );
  });

  test('Should filter by list_id when provided', async () => {
    const listId = 42;
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue([
      { id: 42, list_name: 'Specific List' },
    ]);

    await getUserLists(mockReq, listId);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      expect.any(String),
      expect.arrayContaining([expect.objectContaining({ field: 'list_id', value: 42 })])
    );
  });

  test('Should reject with error object when stored procedure fails', async () => {
    const mockError = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(mockError);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get lists for user',
    });

    await expect(getUserLists(mockReq)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get lists for user',
    });

    expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
      mockReq,
      'FAILED_TO_GET_LIST',
      'Failed to get lists for user',
      mockError
    );
  });
});

describe('Test getAllLists function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_database: 'test_org_db',
      },
    };
    jest.clearAllMocks();
  });

  test('Should call getAllLists stored procedure and return all lists', async () => {
    const mockLists = [
      { id: 1, list_name: 'List 1' },
      { id: 2, list_name: 'List 2' },
      { id: 3, list_name: 'List 3' },
    ];
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockLists);

    const result = await getAllLists(mockReq);

    expect(result).toEqual(mockLists);
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetAllLists',
      expect.arrayContaining([expect.objectContaining({ field: 'list_id', value: null })])
    );
  });

  test('Should reject with error object when stored procedure fails', async () => {
    const mockError = new Error('Connection timeout');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(mockError);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get all lists for the organization.',
    });

    await expect(getAllLists(mockReq)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get all lists for the organization.',
    });

    expect(errorUtils.createErrorMessage).toHaveBeenCalled();
  });
});

describe('Test getListLockStatus function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should return lock status for unlocked list', async () => {
    const mockStatus = {
      lock_status: null,
      lock_user_id: null,
    };
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue([mockStatus]);

    const result = await getListLockStatus(mockReq, 1);

    expect(result).toEqual(mockStatus);
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetListLockStatus',
      expect.arrayContaining([expect.objectContaining({ field: 'list_id', value: 1 })])
    );
  });

  test('Should return lock status for locked list', async () => {
    const lockTime = new Date().getTime();
    const mockStatus = {
      lock_status: lockTime,
      lock_user_id: 456,
    };
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue([mockStatus]);

    const result = await getListLockStatus(mockReq, 2);

    expect(result).toEqual(mockStatus);
    expect(result.lock_user_id).toBe(456);
  });

  test('Should reject with error object when stored procedure fails', async () => {
    const mockError = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(mockError);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LOCK_STATUS',
      message: 'Failed to get lock state for list id 3',
    });

    await expect(getListLockStatus(mockReq, 3)).rejects.toEqual({
      code: 'FAILED_TO_GET_LOCK_STATUS',
      message: 'Failed to get lock state for list id 3',
    });
  });
});

describe('Test setListLocked function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should successfully lock a list', async () => {
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(true);

    const result = await setListLocked(mockReq, 1);

    expect(result).toBe(true);
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspSetListLocked',
      expect.arrayContaining([
        expect.objectContaining({ field: 'list_id', value: 1 }),
        expect.objectContaining({ field: 'user_id', value: 123 }),
      ])
    );
  });

  test('Should reject with error when locking fails', async () => {
    const mockError = new Error('Lock failed');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(mockError);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LOCK_STATUS',
      message: 'Failed to lock list id 5',
    });

    await expect(setListLocked(mockReq, 5)).rejects.toEqual({
      code: 'FAILED_TO_GET_LOCK_STATUS',
      message: 'Failed to lock list id 5',
    });
  });
});

describe('Test setListUnlocked function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should successfully unlock a list', async () => {
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(true);

    const result = await setListUnlocked(mockReq, 1);

    expect(result).toBe(true);
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspSetListUnlocked',
      expect.arrayContaining([
        expect.objectContaining({ field: 'list_id', value: 1 }),
        expect.objectContaining({ field: 'user_id', value: undefined }),
      ])
    );
  });

  test('Should reject with error when unlocking fails', async () => {
    const mockError = new Error('Unlock failed');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(mockError);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LOCK_STATUS',
      message: 'Failed to unlock list id 7',
    });

    await expect(setListUnlocked(mockReq, 7)).rejects.toEqual({
      code: 'FAILED_TO_GET_LOCK_STATUS',
      message: 'Failed to unlock list id 7',
    });
  });
});

describe('Test getListStatusCommonName function', () => {
  test('Should return "Pending" for status id 1', () => {
    const result = getListStatusCommonName(1);
    expect(result).toBe('Pending');
  });

  test('Should return "Active" for status id 2', () => {
    const result = getListStatusCommonName(2);
    expect(result).toBe('Active');
  });

  test('Should return "Inactive" for status id 3', () => {
    const result = getListStatusCommonName(3);
    expect(result).toBe('Inactive');
  });

  test('Should return "Draft" for status id 4', () => {
    const result = getListStatusCommonName(4);
    expect(result).toBe('Draft');
  });

  test('Should return "AnalyzingDiagnostic" for status id 5', () => {
    const result = getListStatusCommonName(5);
    expect(result).toBe('AnalyzingDiagnostic');
  });

  test('Should return "AnalyzingDashboard" for status id 6', () => {
    const result = getListStatusCommonName(6);
    expect(result).toBe('AnalyzingDashboard');
  });

  test('Should return undefined for invalid status id', () => {
    const result = getListStatusCommonName(999);
    expect(result).toBeUndefined();
  });

  test('Should return undefined for null status id', () => {
    const result = getListStatusCommonName(null);
    expect(result).toBeUndefined();
  });
});

describe('Test resetListStatus function', () => {
  let mockReq;
  const listUtils = require('../privateutils/list.utils');
  const logger = require('../privateutils/logger.utils');

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
    logger.logActivity = jest.fn();
  });

  test('Should reset list status to Draft by default', async () => {
    const listId = 1;
    const gfwListId = 0;

    listUtils.getListNameSchema.mockResolvedValue({ list_name: 'Test List' });
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(true);

    const result = await resetListStatus(mockReq, listId, gfwListId);

    expect(result).toBe(true);
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspResetListStatus',
      expect.arrayContaining([
        expect.objectContaining({ field: 'list_id', value: 1 }),
        expect.objectContaining({ field: 'status_id', value: 4 }), // Draft = 4
        expect.objectContaining({ field: 'associated_gfwlist', value: 0 }),
      ])
    );
    expect(logger.logActivity).toHaveBeenCalled();
  });

  test('Should reset list status to specified status', async () => {
    const listId = 2;
    const gfwListId = 1;
    const statusId = 1; // Pending

    listUtils.getListNameSchema.mockResolvedValue({ list_name: 'Another List' });
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(true);

    const result = await resetListStatus(mockReq, listId, gfwListId, statusId);

    expect(result).toBe(true);
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspResetListStatus',
      expect.arrayContaining([
        expect.objectContaining({ field: 'list_id', value: 2 }),
        expect.objectContaining({ field: 'status_id', value: 1 }), // Pending
        expect.objectContaining({ field: 'associated_gfwlist', value: 1 }),
      ])
    );
  });

  test('Should log activity with correct list name and status', async () => {
    const listId = 3;
    const gfwListId = 0;
    const statusId = 2; // Active

    listUtils.getListNameSchema.mockResolvedValue({ list_name: 'Active Test List' });
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(true);

    await resetListStatus(mockReq, listId, gfwListId, statusId);

    expect(logger.logActivity).toHaveBeenCalledWith(
      mockReq,
      'ListUpdate',
      expect.stringContaining('Active Test List is now Active')
    );
  });

  test('Should reject with error when stored procedure fails', async () => {
    const listId = 4;
    const gfwListId = 0;
    const mockError = new Error('Database error');

    listUtils.getListNameSchema.mockResolvedValue({ list_name: 'Failed List' });
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(mockError);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LOCK_STATUS',
      message: 'Error sending Failed List to analysis',
    });

    await expect(resetListStatus(mockReq, listId, gfwListId)).rejects.toEqual({
      code: 'FAILED_TO_GET_LOCK_STATUS',
      message: 'Error sending Failed List to analysis',
    });
  });

  test('Should handle all status types correctly', async () => {
    const listId = 5;
    const gfwListId = 2;
    const statuses = [1, 2, 3, 4, 5, 6]; // All valid statuses

    listUtils.getListNameSchema.mockResolvedValue({ list_name: 'Status Test List' });
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(true);

    for (const statusId of statuses) {
      await resetListStatus(mockReq, listId, gfwListId, statusId);

      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
        mockReq,
        'uspResetListStatus',
        expect.arrayContaining([expect.objectContaining({ field: 'status_id', value: statusId })])
      );
    }
  });
});

describe('Test getListLocations function', () => {
  let mockReq;
  const locationUtils = require('../privateutils/location.utils');

  beforeEach(() => {
    mockReq = {
      session: {
        organization_database: 'test_org_db',
      },
    };
    jest.clearAllMocks();
  });

  test('Should return GeoJSON for list locations', async () => {
    const listId = 1;
    const mockRecordsets = [
      { location_id: 1, name: 'Location 1', latitude: 10.5, longitude: 20.5 },
      { location_id: 2, name: 'Location 2', latitude: 11.5, longitude: 21.5 },
    ];
    const mockGeoJSON = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { location_id: 1, name: 'Location 1' } },
        { type: 'Feature', properties: { location_id: 2, name: 'Location 2' } },
      ],
    };

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockRecordsets);
    locationUtils.createGeoJSON.mockReturnValue(mockGeoJSON);

    const result = await getListLocations(mockReq, listId);

    expect(result).toEqual(mockGeoJSON);
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetListLocations',
      expect.arrayContaining([
        expect.objectContaining({ field: 'listID', value: 1 }),
        expect.objectContaining({ field: 'locationID', value: 0 }),
        expect.objectContaining({ field: 'rowsRequested', value: 100 }), // DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED
      ])
    );
    expect(locationUtils.createGeoJSON).toHaveBeenCalledWith(mockReq, mockRecordsets);
  });

  test('Should use custom locationID and rowsRequested when provided', async () => {
    const listId = 2;
    const locationId = 5;
    const rowsRequested = 50;
    const mockRecordsets = [];
    const mockGeoJSON = { type: 'FeatureCollection', features: [] };

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockRecordsets);
    locationUtils.createGeoJSON.mockReturnValue(mockGeoJSON);

    await getListLocations(mockReq, listId, locationId, rowsRequested);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetListLocations',
      expect.arrayContaining([
        expect.objectContaining({ field: 'listID', value: 2 }),
        expect.objectContaining({ field: 'locationID', value: 5 }),
        expect.objectContaining({ field: 'rowsRequested', value: 50 }),
      ])
    );
  });

  test('Should reject with error when recordsets is null', async () => {
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(null);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get list locations for List 3',
    });

    await expect(getListLocations(mockReq, 3)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get list locations for List 3',
    });
  });

  test('Should reject with error when stored procedure fails', async () => {
    const mockError = new Error('Database connection lost');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(mockError);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get list locations for List 4',
    });

    await expect(getListLocations(mockReq, 4)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get list locations for List 4',
    });
  });
});

describe('Test getSimplifiedListLocations function', () => {
  let mockReq;
  const locationUtils = require('../privateutils/location.utils');

  beforeEach(() => {
    mockReq = {
      session: {
        organization_database: 'test_org_db',
      },
    };
    jest.clearAllMocks();
  });

  test('Should return simplified GeoJSON for list locations', async () => {
    const listId = 1;
    const mockRecordsets = [
      { location_id: 1, name: 'Location 1' },
      { location_id: 2, name: 'Location 2' },
    ];
    const mockGeoJSON = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { location_id: 1 } },
        { type: 'Feature', properties: { location_id: 2 } },
      ],
    };

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockRecordsets);
    locationUtils.createGeoJSON.mockReturnValue(mockGeoJSON);

    const result = await getSimplifiedListLocations(mockReq, listId);

    expect(result).toEqual(mockGeoJSON);
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetSimplifiedListLocations',
      expect.arrayContaining([expect.objectContaining({ field: 'listID', value: 1 })])
    );
  });

  test('Should reject with error when stored procedure fails', async () => {
    const mockError = new Error('Query timeout');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(mockError);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get list locations for List 2',
    });

    await expect(getSimplifiedListLocations(mockReq, 2)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get list locations for List 2',
    });
  });
});

describe('Test getListLocationsNoGeom function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_database: 'test_org_db',
      },
    };
    jest.clearAllMocks();
  });

  test('Should return location metadata without geometry', async () => {
    const listId = 1;
    const mockRecordsets = [
      { location_id: 1, name: 'Location 1', country: 'Brazil' },
      { location_id: 2, name: 'Location 2', country: 'Peru' },
    ];

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockRecordsets);

    const result = await getListLocationsNoGeom(mockReq, listId);

    expect(result).toEqual(mockRecordsets);
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetListLocationsNoGeom',
      expect.arrayContaining([
        expect.objectContaining({ field: 'listID', value: 1 }),
        expect.objectContaining({ field: 'ColumnsToReturn', value: null }),
      ])
    );
  });

  test('Should use custom columns when provided', async () => {
    const listId = 2;
    const columnsToReturn = 'location_id,name,country';

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue([]);

    await getListLocationsNoGeom(mockReq, listId, columnsToReturn);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetListLocationsNoGeom',
      expect.arrayContaining([
        expect.objectContaining({ field: 'listID', value: 2 }),
        expect.objectContaining({ field: 'ColumnsToReturn', value: 'location_id,name,country' }),
      ])
    );
  });

  test('Should reject with error when stored procedure fails', async () => {
    const mockError = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(mockError);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get list location (no Geom) for List 3',
    });

    await expect(getListLocationsNoGeom(mockReq, 3)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get list location (no Geom) for List 3',
    });
  });
});

describe('Test updateIndividualLocationsStatusID function', () => {
  let mockReq;
  const logger = require('../privateutils/logger.utils');

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
    logger.logActivity = jest.fn();
  });

  test('Should update single location status', async () => {
    const analysisTableName = 'analysis-testlist123';
    const locationId = 5;
    const statusId = 2;

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(true);

    const result = await updateIndividualLocationsStatusID(
      mockReq,
      analysisTableName,
      locationId,
      statusId
    );

    expect(result).toBe(true);
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspUpdateLocationAnalysisStatusInBulk',
      expect.arrayContaining([
        expect.objectContaining({ field: 'analysis_table_name', value: analysisTableName }),
        expect.objectContaining({ field: 'location_ids_array', value: '5' }),
        expect.objectContaining({ field: 'location_status_id', value: 2 }),
      ])
    );
    expect(logger.logActivity).toHaveBeenCalledWith(
      mockReq,
      'ListUpdateNew',
      expect.stringContaining('updated list analysis table locations with status ID (2)')
    );
  });

  test('Should update multiple location statuses', async () => {
    const analysisTableName = 'analysis-testlist456';
    const locationIds = [1, 2, 3, 4, 5];
    const statusId = 4;

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(true);

    await updateIndividualLocationsStatusID(mockReq, analysisTableName, locationIds, statusId);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspUpdateLocationAnalysisStatusInBulk',
      expect.arrayContaining([
        expect.objectContaining({ field: 'location_ids_array', value: '1,2,3,4,5' }),
        expect.objectContaining({ field: 'location_status_id', value: 4 }),
      ])
    );
  });

  test('Should reject with error message when stored procedure fails', async () => {
    const mockError = new Error('Update failed');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(mockError);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_UPLOAD_TO_NEW_LIST',
      message: 'Updating list locations status IDs failed',
    });

    await expect(updateIndividualLocationsStatusID(mockReq, 'analysis-fail', 1, 2)).rejects.toBe(
      'Update Individual Locations Status ID FAILED'
    );

    expect(errorUtils.createErrorMessage).toHaveBeenCalled();
  });
});

describe('Test deleteLocations function', () => {
  let mockReq;
  const listUtils = require('../privateutils/list.utils');
  const logger = require('../privateutils/logger.utils');

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
    logger.logActivity = jest.fn();
  });

  test('Should successfully delete locations from unlocked list', async () => {
    const listId = 1;
    const locationIds = [10, 11, 12];
    const gfwListId = 0;
    const mockList = {
      id: 1,
      list_name: 'Test List',
      list_table: 'list-testlist123',
      analysis_table: 'analysis-testlist123',
    };

    // Mock the chain of promises
    sqlUtils.executeOrganizationStoredProcedure
      .mockResolvedValueOnce([{ lock_status: new Date().getTime(), lock_user_id: 123 }]) // getListLockStatus
      .mockResolvedValueOnce(true) // uspUpdateListCount
      .mockResolvedValueOnce(true) // setListUnlocked
      .mockResolvedValueOnce(true); // resetListStatus

    listUtils.getListNameSchema.mockResolvedValue(mockList);
    listUtils.deleteSingleLocation.mockResolvedValue(true);

    const result = await deleteLocations(mockReq, listId, locationIds, gfwListId);

    expect(result).toBe(true);
    expect(listUtils.deleteSingleLocation).toHaveBeenCalledTimes(3);
    expect(logger.logActivity).toHaveBeenCalledWith(
      mockReq,
      'LocationDeletedFromList',
      expect.stringContaining('Locations with IDs (10,11,12) deleted from (Test List)')
    );
  });

  test('Should reject when list is locked by another user', async () => {
    const listId = 2;
    const locationIds = [20];
    const gfwListId = 0;

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValueOnce([
      { lock_status: new Date().getTime(), lock_user_id: 999 }, // Different user
    ]);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_DELETE_LIST',
      message: 'Failed to delete locations from list id 2',
    });

    await expect(deleteLocations(mockReq, listId, locationIds, gfwListId)).rejects.toEqual({
      code: 'FAILED_TO_DELETE_LIST',
      message: 'Failed to delete locations from list id 2',
    });
  });

  test('Should reject when list is unlocked (lock_status is null)', async () => {
    const listId = 3;
    const locationIds = [30];
    const gfwListId = 0;

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValueOnce([
      { lock_status: null, lock_user_id: null },
    ]);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_DELETE_LIST',
      message: 'Failed to delete locations from list id 3',
    });

    await expect(deleteLocations(mockReq, listId, locationIds, gfwListId)).rejects.toEqual({
      code: 'FAILED_TO_DELETE_LIST',
      message: 'Failed to delete locations from list id 3',
    });
  });

  test('Should reject with error when deletion fails', async () => {
    const listId = 4;
    const locationIds = [40];
    const gfwListId = 0;
    const mockError = new Error('Deletion failed');

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValueOnce([
      { lock_status: new Date().getTime(), lock_user_id: 123 },
    ]);
    listUtils.getListNameSchema.mockRejectedValue(mockError);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_DELETE_LIST',
      message: 'Failed to delete locations from list id 4',
    });

    await expect(deleteLocations(mockReq, listId, locationIds, gfwListId)).rejects.toEqual({
      code: 'FAILED_TO_DELETE_LIST',
      message: 'Failed to delete locations from list id 4',
    });
  });
});

describe('Test editLocations function', () => {
  let mockReq;
  const listUtils = require('../privateutils/list.utils');
  const logger = require('../privateutils/logger.utils');

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
    logger.logActivity = jest.fn();
  });

  test('Should successfully edit locations when list is locked by user', async () => {
    const listId = 1;
    const locationIds = [10, 11];
    const arrayAttributes = [
      { 'Location Name': 'Updated Location 1', Country: 'Brazil', Custom1: 'Value1' },
      { 'Location Name': 'Updated Location 2', Country: 'Peru', Custom2: 'Value2' },
    ];

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValueOnce([
      { lock_status: new Date().getTime(), lock_user_id: 123 },
    ]);
    listUtils.editSingleLocation.mockResolvedValue(true);

    const result = await editLocations(mockReq, listId, locationIds, arrayAttributes);

    expect(result).toBe(true);
    expect(listUtils.editSingleLocation).toHaveBeenCalledTimes(2);
    expect(listUtils.editSingleLocation).toHaveBeenCalledWith(
      mockReq,
      listId,
      10,
      expect.objectContaining({
        country: 'Brazil',
        custom1: 'Value1',
      })
    );
    expect(logger.logActivity).toHaveBeenCalledWith(
      mockReq,
      'LocationUpdatedInList',
      'Locations have been updated.'
    );
  });

  test('Should filter out excluded columns', async () => {
    const listId = 2;
    const locationIds = [20];
    const arrayAttributes = [
      {
        'Location Name': 'Test', // Should be excluded
        list_id: 999, // Should be excluded
        latitude: 10.5, // Should be excluded
        longitude: 20.5, // Should be excluded
        'analysis area': 1000, // Should be excluded
        commodity: 'Palm Oil', // Should be excluded
        CustomAttribute: 'Should Stay',
      },
    ];

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValueOnce([
      { lock_status: new Date().getTime(), lock_user_id: 123 },
    ]);
    listUtils.editSingleLocation.mockResolvedValue(true);

    await editLocations(mockReq, listId, locationIds, arrayAttributes);

    expect(listUtils.editSingleLocation).toHaveBeenCalledWith(
      mockReq,
      listId,
      20,
      expect.objectContaining({
        customattribute: 'Should Stay',
      })
    );
    // Verify excluded fields are not present
    const callArgs = listUtils.editSingleLocation.mock.calls[0][3];
    expect(callArgs).not.toHaveProperty('location name');
    expect(callArgs).not.toHaveProperty('list_id');
    expect(callArgs).not.toHaveProperty('latitude');
    expect(callArgs).not.toHaveProperty('commodity');
  });

  test('Should reject when location_ids and arrayAttributes length mismatch', async () => {
    const listId = 3;
    const locationIds = [30, 31];
    const arrayAttributes = [{ name: 'Only One' }]; // Mismatch

    await expect(editLocations(mockReq, listId, locationIds, arrayAttributes)).rejects.toThrow(
      'Length of arguments do not match.'
    );
  });

  test('Should reject when list is locked by another user', async () => {
    const listId = 4;
    const locationIds = [40];
    const arrayAttributes = [{ name: 'Test' }];

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValueOnce([
      { lock_status: new Date().getTime(), lock_user_id: 999 },
    ]);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_UPDATE_LISTS',
      message: 'Failed to update locations from list id 4',
    });

    await expect(editLocations(mockReq, listId, locationIds, arrayAttributes)).rejects.toEqual({
      code: 'FAILED_TO_UPDATE_LISTS',
      message: 'Failed to update locations from list id 4',
    });
  });

  test('Should reject with error when edit fails', async () => {
    const listId = 5;
    const locationIds = [50];
    const arrayAttributes = [{ name: 'Test' }];
    const mockError = new Error('Edit failed');

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValueOnce([
      { lock_status: new Date().getTime(), lock_user_id: 123 },
    ]);
    listUtils.editSingleLocation.mockRejectedValue(mockError);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_UPDATE_LISTS',
      message: 'Failed to update locations from list id 5',
    });

    await expect(editLocations(mockReq, listId, locationIds, arrayAttributes)).rejects.toEqual({
      code: 'FAILED_TO_UPDATE_LISTS',
      message: 'Failed to update locations from list id 5',
    });
  });
});

describe('Test getListLocations function', () => {
  const locationUtils = require('../privateutils/location.utils');
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should return GeoJSON when recordsets are returned', async () => {
    const listId = 1;
    const mockRecordsets = [
      { location_id: 1, name: 'Location 1' },
      { location_id: 2, name: 'Location 2' },
    ];
    const mockGeoJSON = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: { location_id: 1 } }],
    };

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockRecordsets);
    locationUtils.createGeoJSON.mockReturnValue(mockGeoJSON);

    const result = await getListLocations(mockReq, listId);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetListLocations',
      expect.any(Array)
    );
    expect(locationUtils.createGeoJSON).toHaveBeenCalledWith(mockReq, mockRecordsets);
    expect(result).toEqual(mockGeoJSON);
  });

  test('Should reject when recordsets is falsy', async () => {
    const listId = 2;
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(null);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed',
    });

    await expect(getListLocations(mockReq, listId)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed',
    });
  });

  test('Should use provided location_id and rowsRequested', async () => {
    const listId = 3;
    const locationId = 5;
    const rowsRequested = 50;
    const mockRecordsets = [];
    const mockGeoJSON = { type: 'FeatureCollection', features: [] };

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockRecordsets);
    locationUtils.createGeoJSON.mockReturnValue(mockGeoJSON);

    await getListLocations(mockReq, listId, locationId, rowsRequested);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetListLocations',
      expect.arrayContaining([
        { field: 'listID', type: expect.anything(), value: listId },
        { field: 'locationID', type: expect.anything(), value: locationId },
        { field: 'rowsRequested', type: expect.anything(), value: rowsRequested },
      ])
    );
  });

  test('Should reject when stored procedure fails', async () => {
    const listId = 4;
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get list locations',
    });

    await expect(getListLocations(mockReq, listId)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get list locations',
    });
  });
});

describe('Test getSimplifiedListLocations function', () => {
  const locationUtils = require('../privateutils/location.utils');
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should return simplified GeoJSON', async () => {
    const listId = 1;
    const mockRecordsets = [
      { location_id: 1, name: 'Location 1' },
      { location_id: 2, name: 'Location 2' },
    ];
    const mockGeoJSON = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: { location_id: 1 } }],
    };

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockRecordsets);
    locationUtils.createGeoJSON.mockReturnValue(mockGeoJSON);

    const result = await getSimplifiedListLocations(mockReq, listId);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetSimplifiedListLocations',
      expect.arrayContaining([{ field: 'listID', type: expect.anything(), value: listId }])
    );
    expect(locationUtils.createGeoJSON).toHaveBeenCalledWith(mockReq, mockRecordsets);
    expect(result).toEqual(mockGeoJSON);
  });

  test('Should reject when stored procedure fails', async () => {
    const listId = 2;
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed',
    });

    await expect(getSimplifiedListLocations(mockReq, listId)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed',
    });
  });
});

describe('Test getListLocationsNoGeom function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should return recordsets without geometry', async () => {
    const listID = 1;
    const mockRecordsets = [
      { location_id: 1, name: 'Location 1', status: 'active' },
      { location_id: 2, name: 'Location 2', status: 'active' },
    ];

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockRecordsets);

    const result = await getListLocationsNoGeom(mockReq, listID);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetListLocationsNoGeom',
      expect.any(Array)
    );
    const callArgs = sqlUtils.executeOrganizationStoredProcedure.mock.calls[0][2];
    expect(callArgs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'listID', value: listID }),
        expect.objectContaining({ field: 'ColumnsToReturn', value: null }),
      ])
    );
    expect(result).toEqual(mockRecordsets);
  });

  test('Should use provided columnsToReturn parameter', async () => {
    const listID = 2;
    const columnsToReturn = 'location_id,name,status';
    const mockRecordsets = [];

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockRecordsets);

    await getListLocationsNoGeom(mockReq, listID, columnsToReturn);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetListLocationsNoGeom',
      expect.any(Array)
    );
    const callArgs = sqlUtils.executeOrganizationStoredProcedure.mock.calls[0][2];
    expect(callArgs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'listID', value: listID }),
        expect.objectContaining({ field: 'ColumnsToReturn', value: columnsToReturn }),
      ])
    );
  });

  test('Should reject when stored procedure fails', async () => {
    const listID = 3;
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed',
    });

    await expect(getListLocationsNoGeom(mockReq, listID)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed',
    });
  });
});

describe('Test getPaginatedAnalysisDataForUserList function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
        user_access_level_id: 3,
        organization_database: 'test_db',
      },
    };
    jest.clearAllMocks();
  });

  test('Should return paginated analysis data', async () => {
    const listID = 1;
    const filters = {
      page: 1,
      pageSize: 10,
      searchString: 'test',
      country: 'Brazil',
    };

    const mockRecordsets = [
      { location_id: 1, name: 'Loc1' },
      { location_id: 2, name: 'Loc2' },
    ];

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockRecordsets);

    const result = await getPaginatedAnalysisDataForUserList(mockReq, listID, filters);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetPaginatedAnalysisDataForUserList',
      expect.any(Array)
    );
    expect(result).toEqual(mockRecordsets);
  });

  test('Should handle empty filters', async () => {
    const listID = 2;
    const filters = {};
    const mockRecordsets = [];

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockRecordsets);

    const result = await getPaginatedAnalysisDataForUserList(mockReq, listID, filters);

    expect(result).toEqual(mockRecordsets);
  });

  test('Should reject when stored procedure fails', async () => {
    const listID = 4;
    const filters = { page: 1 };
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed',
    });

    await expect(getPaginatedAnalysisDataForUserList(mockReq, listID, filters)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed',
    });
  });
});

describe('Test getNumberPagesForAnalysisDataUserList function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
        user_access_level_id: 3,
      },
    };
    jest.clearAllMocks();
  });

  test('Should return page count information', async () => {
    const listID = 1;
    const filters = {
      pageSize: 10,
      searchString: 'test',
      country: 'Brazil',
    };

    const mockRecordsets = [
      { statistic_type: 'Row Count', statistic: 50 },
      { statistic_type: 'Max Area', statistic: 1000 },
    ];

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockRecordsets);

    const result = await getNumberPagesForAnalysisDataUserList(mockReq, listID, filters);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetAnalysisDataCountForUserList',
      expect.any(Array)
    );
    expect(result).toEqual({
      numberOfPages: 5,
      numberOfResults: 50,
      maximumAnalysisAreaInTheList: 1000,
    });
  });

  test('Should handle empty filters', async () => {
    const listID = 2;
    const filters = {};

    const mockRecordsets = [
      { statistic_type: 'Row Count', statistic: 10 },
      { statistic_type: 'Max Area', statistic: 500 },
    ];

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockRecordsets);

    const result = await getNumberPagesForAnalysisDataUserList(mockReq, listID, filters);

    expect(result.numberOfPages).toBe(1);
    expect(result.numberOfResults).toBe(10);
  });

  test('Should reject when stored procedure fails', async () => {
    const listID = 4;
    const filters = {};
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed',
    });

    await expect(getNumberPagesForAnalysisDataUserList(mockReq, listID, filters)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed',
    });
  });
});

describe('Test checkListLockStatus function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should lock list when lock_status is null (unlocked)', async () => {
    const listId = 1;
    const record = {
      lock_status: null,
      lock_user_id: null,
    };

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(undefined);

    const result = await checkListLockStatus(mockReq, listId, record);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspSetListLocked',
      expect.any(Array)
    );
    expect(result).toEqual({
      isLocked: false,
      lock_user_id: null,
    });
  });

  test('Should resolve as locked when list locked within 15 minutes', async () => {
    const listId = 2;
    const now = new Date().getTime();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const record = {
      lock_status: fiveMinutesAgo,
      lock_user_id: 456,
    };

    const result = await checkListLockStatus(mockReq, listId, record);

    expect(result).toEqual({
      isLocked: true,
      lock_user_id: 456,
    });
  });

  test('Should unlock and relock when list locked for more than 15 minutes', async () => {
    const listId = 3;
    const now = new Date().getTime();
    const twentyMinutesAgo = now - 20 * 60 * 1000;
    const record = {
      lock_status: twentyMinutesAgo,
      lock_user_id: 456,
    };

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(undefined);

    const result = await checkListLockStatus(mockReq, listId, record);

    // Should call setListUnlocked and then setListLocked
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspSetListUnlocked',
      expect.any(Array)
    );
    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspSetListLocked',
      expect.any(Array)
    );
    expect(result).toEqual({
      isLocked: false,
      lock_user_id: 456,
    });
  });

  test('Should reject when setListLocked fails for unlocked list', async () => {
    const listId = 4;
    const record = {
      lock_status: null,
      lock_user_id: null,
    };
    const error = new Error('Failed to lock');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LOCK_STATUS',
      message: 'Failed',
    });

    await expect(checkListLockStatus(mockReq, listId, record)).rejects.toEqual({
      error: true,
      errorMessage: {
        code: 'FAILED_TO_GET_LOCK_STATUS',
        message: 'Failed',
      },
    });
  });
});

describe('Test getLocationsCount function', () => {
  let mockReq;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should use admin stored procedure for admin users', async () => {
    mockReq = {
      session: {
        organization_user_id: 123,
        user_access_level_id: 1, // Admin
        organization_database: 'test_db',
      },
    };
    const mockRecordsets = [{ location_count: 50 }];

    sqlUtils.executeSystemStoredProcedure.mockResolvedValue(mockRecordsets);

    const result = await getLocationsCount(mockReq);

    expect(sqlUtils.executeSystemStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetLocationsCount',
      expect.any(Array)
    );
    expect(result).toEqual({ location_count: 50 });
  });

  test('Should use editor stored procedure for non-admin users', async () => {
    mockReq = {
      session: {
        organization_user_id: 123,
        user_access_level_id: 3, // Editor
        organization_database: 'test_db',
      },
    };
    const mockRecordsets = [{ location_count: 25 }];

    sqlUtils.executeSystemStoredProcedure.mockResolvedValue(mockRecordsets);

    const result = await getLocationsCount(mockReq);

    expect(sqlUtils.executeSystemStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetLocationsCountEditor',
      expect.any(Array)
    );
    expect(result).toEqual({ location_count: 25 });
  });

  test('Should reject when stored procedure fails', async () => {
    mockReq = {
      session: {
        organization_user_id: 123,
        user_access_level_id: 1,
        organization_database: 'test_db',
      },
    };
    const error = new Error('Database error');
    sqlUtils.executeSystemStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LOCATIONS_COUNT',
      message: 'Failed',
    });

    await expect(getLocationsCount(mockReq)).rejects.toEqual({
      code: 'FAILED_TO_GET_LOCATIONS_COUNT',
      message: 'Failed',
    });
  });
});

// copyLocations and moveLocations have complex signatures requiring GeoJSON and specific parameters
// These are tested through integration tests and their complexity makes unit testing fragile
// Skipping detailed unit tests for these functions

describe('Test setListLocked function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should successfully lock a list', async () => {
    const listId = 1;
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(undefined);

    const result = await setListLocked(mockReq, listId);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspSetListLocked',
      expect.arrayContaining([
        expect.objectContaining({ field: 'list_id', value: listId }),
        expect.objectContaining({
          field: 'user_id',
          value: mockReq.session.organization_user_id,
        }),
      ])
    );
    expect(result).toBe(true);
  });

  test('Should reject when stored procedure fails', async () => {
    const listId = 2;
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LOCK_STATUS',
      message: 'Failed to lock list',
    });

    await expect(setListLocked(mockReq, listId)).rejects.toEqual({
      code: 'FAILED_TO_GET_LOCK_STATUS',
      message: 'Failed to lock list',
    });
  });
});

describe('Test setListUnlocked function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should successfully unlock a list', async () => {
    const listId = 1;
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(undefined);

    const result = await setListUnlocked(mockReq, listId);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspSetListUnlocked',
      expect.arrayContaining([expect.objectContaining({ field: 'list_id', value: listId })])
    );
    expect(result).toBe(true);
  });

  test('Should reject when stored procedure fails', async () => {
    const listId = 2;
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LOCK_STATUS',
      message: 'Failed to unlock list',
    });

    await expect(setListUnlocked(mockReq, listId)).rejects.toEqual({
      code: 'FAILED_TO_GET_LOCK_STATUS',
      message: 'Failed to unlock list',
    });
  });
});

describe('Test resetListStatus function', () => {
  let mockReq;
  const AnalysisManager = require('./analysisManager.utils');

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
    AnalysisManager.requestAnalysis = jest.fn().mockResolvedValue(undefined);
  });

  test('Should reset list status and trigger analysis', async () => {
    const listId = 1;
    const gfwListId = 0;
    const statusId = 4; // Draft
    const listUtils = require('../privateutils/list.utils');
    listUtils.getListNameSchema.mockResolvedValue({
      list_name: 'test-list',
      id: listId,
    });
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(undefined);

    await resetListStatus(mockReq, listId, gfwListId, statusId);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspResetListStatus',
      expect.arrayContaining([
        expect.objectContaining({ field: 'list_id', value: listId }),
        expect.objectContaining({ field: 'status_id', value: statusId }),
        expect.objectContaining({ field: 'associated_gfwlist', value: gfwListId }),
      ])
    );
  });

  test('Should reject when getListNameSchema fails', async () => {
    const listId = 2;
    const gfwListId = 0;
    const statusId = 4;
    const error = new Error('Failed to get list schema');
    const listUtils = require('../privateutils/list.utils');
    listUtils.getListNameSchema.mockRejectedValue(error);

    await expect(resetListStatus(mockReq, listId, gfwListId, statusId)).rejects.toBeTruthy();
  });
});

describe('Test getListLocations function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should get list locations with default pagination', async () => {
    const listId = 1;
    const mockLocations = [
      { id: 1, name: 'Location 1', geometry: {} },
      { id: 2, name: 'Location 2', geometry: {} },
    ];
    const mockGeoJSON = { type: 'FeatureCollection', features: [] };
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockLocations);
    const locationUtils = require('../privateutils/location.utils');
    locationUtils.createGeoJSON.mockReturnValue(mockGeoJSON);

    const result = await getListLocations(mockReq, listId);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetListLocations',
      expect.arrayContaining([
        expect.objectContaining({ field: 'listID', value: listId }),
        expect.objectContaining({ field: 'locationID', value: 0 }),
        expect.objectContaining({ field: 'rowsRequested', value: 100 }), // DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED
      ])
    );
    expect(result).toEqual(mockGeoJSON);
  });

  test('Should get list locations with custom pagination', async () => {
    const listId = 2;
    const locationID = 5;
    const rowsRequested = 50;
    const mockLocations = [{ id: 3, name: 'Location 3', geometry: {} }];
    const mockGeoJSON = { type: 'FeatureCollection', features: [] };
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockLocations);
    const locationUtils = require('../privateutils/location.utils');
    locationUtils.createGeoJSON.mockReturnValue(mockGeoJSON);

    const result = await getListLocations(mockReq, listId, locationID, rowsRequested);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetListLocations',
      expect.arrayContaining([
        expect.objectContaining({ field: 'listID', value: listId }),
        expect.objectContaining({ field: 'locationID', value: locationID }),
        expect.objectContaining({ field: 'rowsRequested', value: rowsRequested }),
      ])
    );
    expect(result).toEqual(mockGeoJSON);
  });

  test('Should reject when stored procedure fails', async () => {
    const listId = 3;
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get list locations',
    });

    await expect(getListLocations(mockReq, listId)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get list locations',
    });
  });
});

describe('Test getSimplifiedListLocations function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should get simplified list locations', async () => {
    const listId = 1;
    const mockLocations = [
      { id: 1, name: 'Location 1' },
      { id: 2, name: 'Location 2' },
    ];
    const mockGeoJSON = { type: 'FeatureCollection', features: [] };
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockLocations);
    const locationUtils = require('../privateutils/location.utils');
    locationUtils.createGeoJSON.mockReturnValue(mockGeoJSON);

    const result = await getSimplifiedListLocations(mockReq, listId);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetSimplifiedListLocations',
      expect.arrayContaining([expect.objectContaining({ field: 'listID', value: listId })])
    );
    expect(result).toEqual(mockGeoJSON);
  });

  test('Should reject when stored procedure fails', async () => {
    const listId = 2;
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get simplified locations',
    });

    await expect(getSimplifiedListLocations(mockReq, listId)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get simplified locations',
    });
  });
});

describe('Test getListLocationsNoGeom function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should get list locations without geometry with default pagination', async () => {
    const listId = 1;
    const mockLocations = [
      { id: 1, name: 'Location 1' },
      { id: 2, name: 'Location 2' },
    ];
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockLocations);

    const result = await getListLocationsNoGeom(mockReq, listId);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetListLocationsNoGeom',
      expect.arrayContaining([
        expect.objectContaining({ field: 'listID', value: listId }),
        expect.objectContaining({ field: 'ColumnsToReturn', value: null }),
      ])
    );
    expect(result).toEqual(mockLocations);
  });

  test('Should get list locations without geometry with custom columns', async () => {
    const listId = 2;
    const columnsToReturn = 'id,name,status';
    const mockLocations = [{ id: 3, name: 'Location 3' }];
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockLocations);

    const result = await getListLocationsNoGeom(mockReq, listId, columnsToReturn);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetListLocationsNoGeom',
      expect.arrayContaining([
        expect.objectContaining({ field: 'listID', value: listId }),
        expect.objectContaining({ field: 'ColumnsToReturn', value: columnsToReturn }),
      ])
    );
    expect(result).toEqual(mockLocations);
  });

  test('Should reject when stored procedure fails', async () => {
    const listId = 3;
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get locations without geometry',
    });

    await expect(getListLocationsNoGeom(mockReq, listId)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get locations without geometry',
    });
  });
});

describe('Test getPaginatedAnalysisDataForUserList function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
        organization_database: 'test_db',
      },
    };
    jest.clearAllMocks();
  });

  test('Should get paginated analysis data with filters', async () => {
    const listId = 1;
    const filters = {
      selectedSupplier: 'Supplier A',
      selectedSecondSupplier: 'Supplier B',
      selectedParentCompany: 'Company C',
      showRSPOCertified: true,
      selectedOverallThreats: ['threat1', 'threat2'],
      selectedOverallValues: ['high', 'medium'],
      selectedMillPriority: ['priority1'],
      page: 1,
      pageSize: 50,
    };
    const mockData = [{ id: 1, analysis_data: 'data' }];
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockData);
    const { getListJsonAttributesColumnsSqlParam } = require('@wri-monorepos/sql');
    getListJsonAttributesColumnsSqlParam.mockResolvedValue('[]');

    const result = await getPaginatedAnalysisDataForUserList(mockReq, listId, filters);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetPaginatedAnalysisDataForUserList',
      expect.any(Array)
    );
    expect(result).toEqual(mockData);
  });

  test('Should reject when stored procedure fails', async () => {
    const listId = 2;
    const filters = {};
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get paginated analysis data',
    });
    const { getListJsonAttributesColumnsSqlParam } = require('@wri-monorepos/sql');
    getListJsonAttributesColumnsSqlParam.mockResolvedValue('[]');

    await expect(getPaginatedAnalysisDataForUserList(mockReq, listId, filters)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get paginated analysis data',
    });
  });
});

describe('Test getNumberPagesForAnalysisDataUserList function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should get number of pages for analysis data', async () => {
    const listId = 1;
    const filters = {
      selectedSupplier: 'Supplier A',
      pageSize: 50,
    };
    const mockResult = [
      { statistic_type: 'Row Count', statistic: 250 },
      { statistic_type: 'Max Area', statistic: 10000 },
    ];
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockResult);

    const result = await getNumberPagesForAnalysisDataUserList(mockReq, listId, filters);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetAnalysisDataCountForUserList',
      expect.any(Array)
    );
    expect(result).toEqual({
      numberOfPages: 5, // 250 / 50
      numberOfResults: 250,
      maximumAnalysisAreaInTheList: 10000,
    });
  });

  test('Should reject when stored procedure fails', async () => {
    const listId = 2;
    const filters = {};
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get number of pages',
    });

    await expect(getNumberPagesForAnalysisDataUserList(mockReq, listId, filters)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get number of pages',
    });
  });
});

describe('Test uploadToExistingList function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should upload locations to existing list', async () => {
    const listId = 1;
    const listName = 'test-list';
    const geojson = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: {}, properties: {} }],
    };
    const commodity = 'palm-oil';
    const attributes = { custom: 'attribute' };
    const mockResult = { success: true };
    const listUtils = require('../privateutils/list.utils');
    listUtils.uploadBulkLocations.mockResolvedValue(mockResult);

    const result = await uploadToExistingList(
      mockReq,
      listId,
      listName,
      geojson,
      commodity,
      attributes
    );

    expect(listUtils.uploadBulkLocations).toHaveBeenCalledWith(
      mockReq,
      listId,
      listName,
      geojson,
      commodity,
      attributes
    );
    expect(result).toEqual(mockResult);
  });

  test('Should propagate error when upload fails', async () => {
    const listId = 2;
    const listName = 'test-list';
    const geojson = { type: 'FeatureCollection', features: [] };
    const commodity = null;
    const attributes = null;
    const error = new Error('Upload failed');
    const listUtils = require('../privateutils/list.utils');
    listUtils.uploadBulkLocations.mockRejectedValue(error);

    await expect(
      uploadToExistingList(mockReq, listId, listName, geojson, commodity, attributes)
    ).rejects.toThrow(error);
  });
});

describe('Test getListLocationGeometry function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
      body: {},
    };
    jest.clearAllMocks();
  });

  test('Should get location geometry', async () => {
    const listTableName = 'list_test';
    const locationID = 5;
    mockReq.body = {
      listTableName,
      locationID,
    };
    const mockGeometry = [{ id: locationID, geometry: { type: 'Point', coordinates: [0, 0] } }];
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockGeometry);

    const result = await getListLocationGeometry(mockReq);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetLocation',
      expect.arrayContaining([
        expect.objectContaining({ field: 'list_table', value: listTableName }),
        expect.objectContaining({ field: 'location_id', value: locationID }),
      ])
    );
    expect(result).toEqual(mockGeometry);
  });
});

describe('Test deleteListIfEmpty function', () => {
  let mockReq;
  const logger = require('../privateutils/logger.utils');

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
        organization_database: 'test_db',
      },
    };
    jest.clearAllMocks();
    const { DeleteListTypeOrm } = require('@wri-monorepos/sql');
    DeleteListTypeOrm.mockClear();
  });

  test('Should delete list when it is empty', async () => {
    const listID = 1;
    const listUtils = require('../privateutils/list.utils');
    const { DeleteListTypeOrm } = require('@wri-monorepos/sql');
    
    listUtils.getListNameSchema.mockResolvedValue({
      list_name: 'empty-list',
      id: listID,
    });
    
    // Mock DeleteListTypeOrm
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    DeleteListTypeOrm.mockImplementation(() => ({
      delete: mockDelete,
    }));
    
    sqlUtils.executeOrganizationStoredProcedure
      .mockResolvedValueOnce([{ isListEmpty: true }]) // uspCheckIfListIsEmpty
      .mockResolvedValueOnce([{ lock_status: Date.now(), lock_user_id: 123 }]); // uspGetListLockStatus

    const result = await deleteListIfEmpty(mockReq, listID);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspCheckIfListIsEmpty',
      expect.arrayContaining([expect.objectContaining({ field: 'list_id', value: listID })])
    );
    expect(logger.logActivity).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  test('Should not delete list when it is not empty', async () => {
    const listID = 2;
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValueOnce([{ isListEmpty: false }]);

    const result = await deleteListIfEmpty(mockReq, listID);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspCheckIfListIsEmpty',
      expect.any(Array)
    );
    expect(result).toBe(false);
  });

  test('Should reject when check fails', async () => {
    const listID = 3;
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_DELETE_LIST_IS_NOT_EMPTY',
      message: 'Failed',
    });

    await expect(deleteListIfEmpty(mockReq, listID)).rejects.toEqual({
      code: 'FAILED_TO_DELETE_LIST_IS_NOT_EMPTY',
      message: 'Failed',
    });
  });
});

describe('Test getListAdminAreasOrderedByCountry function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should get admin areas ordered by country', async () => {
    const listId = 1;
    const mockAdminAreas = [
      { country: 'Brazil', admin_area: 'Para' },
      { country: 'Indonesia', admin_area: 'Sumatra' },
    ];
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockAdminAreas);

    const result = await getListAdminAreasOrderedByCountry(mockReq, listId);

    expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
      mockReq,
      'uspGetAdminAreas',
      expect.arrayContaining([expect.objectContaining({ field: 'listID', value: listId })])
    );
    expect(result).toEqual(mockAdminAreas);
  });

  test('Should reject when stored procedure fails', async () => {
    const listId = 2;
    const error = new Error('Database error');
    sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get admin areas',
    });

    await expect(getListAdminAreasOrderedByCountry(mockReq, listId)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to get admin areas',
    });
  });
});

describe('Test deleteList function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
        organization_database: 'test_db',
      },
    };
    jest.clearAllMocks();
  });

  test('Should delete list successfully', async () => {
    const listId = 1;
    const listUtils = require('../privateutils/list.utils');
    const { DeleteListTypeOrm } = require('@wri-monorepos/sql');
    
    // Mock getListLockStatus
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValueOnce([
      { lock_status: Date.now(), lock_user_id: 123 },
    ]);
    
    // Mock getListNameSchema
    listUtils.getListNameSchema.mockResolvedValue({
      list_name: 'test-list',
      id: listId,
    });
    
    // Mock DeleteListTypeOrm
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    DeleteListTypeOrm.mockImplementation(() => ({
      delete: mockDelete,
    }));

    const result = await deleteList(mockReq, listId);

    expect(result).toBe(true);
  });

  test('Should reject when list is locked by another user', async () => {
    const listId = 2;
    const listUtils = require('../privateutils/list.utils');
    const { DeleteListTypeOrm } = require('@wri-monorepos/sql');
    
    // Clear all previous mocks
    jest.clearAllMocks();
    
    // Mock getListLockStatus - locked by another user
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue([
      { lock_status: Date.now(), lock_user_id: 999 }, // Different user
    ]);
    
    listUtils.getListNameSchema.mockResolvedValue({
      list_name: 'test-list',
      id: listId,
    });
    
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_DELETE_LIST',
      message: 'Failed to delete list',
    });
    
    // Mock DeleteListTypeOrm (won't be called but needed for module import)
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    DeleteListTypeOrm.mockImplementation(() => ({
      delete: mockDelete,
    }));
    
    // deleteList wraps the validation error in an error object
    await expect(deleteList(mockReq, listId)).rejects.toEqual({
      code: 'FAILED_TO_DELETE_LIST',
      message: 'Failed to delete list',
    });
  });

  test('Should reject when deletion fails', async () => {
    const listId = 3;
    const listUtils = require('../privateutils/list.utils');
    const { DeleteListTypeOrm } = require('@wri-monorepos/sql');
    const error = new Error('Deletion failed');
    
    // Mock successful lock check
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue([
      { lock_status: Date.now(), lock_user_id: 123 },
    ]);
    
    listUtils.getListNameSchema.mockResolvedValue({
      list_name: 'test-list',
      id: listId,
    });
    
    // Mock DeleteListTypeOrm to fail
    const mockDelete = jest.fn().mockRejectedValue(error);
    DeleteListTypeOrm.mockImplementation(() => ({
      delete: mockDelete,
    }));
    
    errorUtils.createErrorMessage.mockReturnValueOnce({
      code: 'FAILED_TO_DELETE_LIST',
      message: 'Failed to delete list',
    });

    await expect(deleteList(mockReq, listId)).rejects.toEqual({
      code: 'FAILED_TO_DELETE_LIST',
      message: 'Failed to delete list',
    });
  });
});

describe('Test mergeListsWithAnalysisId function', () => {
  test('Should merge lists with analysis status and update to worst status', () => {
    const lists = [
      { id: 1, list_status_id: 2, listAnalysesStatus: null },
      { id: 2, list_status_id: 1, listAnalysesStatus: null },
    ];
    const listAnalysisStatuses = [
      { listId: 1, status: 4 }, // Draft - worst
      { listId: 1, status: 2 }, // Active
      { listId: 2, status: 2 }, // Active
      { listId: 2, status: 2 }, // Active
    ];

    mergeListsWithAnalysisId(lists, listAnalysisStatuses);

    expect(lists[0].list_status_id).toBe(4); // Should update to worst (Draft)
    expect(lists[0].listAnalysesStatus).toHaveLength(2);
    expect(lists[1].list_status_id).toBe(2); // Should stay as Active
    expect(lists[1].listAnalysesStatus).toHaveLength(2);
  });

  test('Should keep original status when no analysis statuses found', () => {
    const lists = [{ id: 1, list_status_id: 3, listAnalysesStatus: null }];
    const listAnalysisStatuses = [];

    mergeListsWithAnalysisId(lists, listAnalysisStatuses);

    expect(lists[0].list_status_id).toBe(3); // Should keep original
    expect(lists[0].listAnalysesStatus).toEqual([]);
  });
});

describe('Test getUserListsWithAnalysisId function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        ispromanager: false,
        user_access_level_id: 3,
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should get user lists with analysis status', async () => {
    const mockLists = [
      {
        id: 1,
        list_name: 'Test List',
        listAnalysesStatus: JSON.stringify([{ status: 2 }, { status: 4 }]),
      },
    ];
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockLists);

    const result = await getUserListsWithAnalysisId(mockReq);

    expect(result).toHaveLength(1);
    expect(result[0].isGlobalForestWatchList).toBe(false);
    expect(result[0].list_status_id).toBe(4); // Should be updated to worst
  });
});

describe('Test getAllListsWithAnalysisId function', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
    };
    jest.clearAllMocks();
  });

  test('Should get all lists with analysis status', async () => {
    const mockLists = [
      {
        id: 1,
        list_name: 'Org List',
        listAnalysesStatus: JSON.stringify([{ status: 1 }, { status: 4 }]),
      },
    ];
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockLists);

    const result = await getAllListsWithAnalysisId(mockReq);

    expect(result).toHaveLength(1);
    expect(result[0].list_status_id).toBe(4); // Should be updated to worst
  });
});

describe('Test rerunExistingList function', () => {
  let mockReq;
  const listUtils = require('../privateutils/list.utils');
  const analysisUtils = require('../privateutils/analysis.utils');
  const logger = require('../privateutils/logger.utils');

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
      body: {
        list_name: 'test-list',
        list_locations_count: 50,
      },
    };
    jest.clearAllMocks();
  });

  test('Should reject when analysis fails', async () => {
    const error = new Error('Analysis failed');
    const mockList = { list_name: 'test-list' };
    listUtils.createListNameSchema.mockReturnValue(mockList);
    analysisUtils.analyzeList.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to run the re-run stored procedure...',
    });

    await expect(rerunExistingList(mockReq)).rejects.toEqual({
      code: 'FAILED_TO_GET_LIST',
      message: 'Failed to run the re-run stored procedure...',
    });
  });
});

describe('Test moveLocations function', () => {
  let mockReq;
  const listUtils = require('../privateutils/list.utils');
  const logger = require('../privateutils/logger.utils');

  beforeEach(() => {
    mockReq = {
      session: {
        organization_user_id: 123,
      },
      body: {
        list_status_id: 4,
      },
    };
    jest.clearAllMocks();
  });

  test('Should move locations and delete source locations', async () => {
    const srcListId = 1;
    const srcLocationIds = [1, 2];
    const destListId = 2;
    const geojson = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { location_id: 1 }, geometry: {} },
        { type: 'Feature', properties: { location_id: 2 }, geometry: {} },
      ],
    };
    const gfwListId = 0;
    const deleteSrcList = false;

    const srcList = { id: srcListId, list_name: 'source-list' };
    const destList = { id: destListId, list_name: 'dest-list' };

    listUtils.getListNameSchema
      .mockResolvedValueOnce(srcList)
      .mockResolvedValueOnce(destList)
      .mockResolvedValueOnce(srcList); // For deleteLocations

    // Mock for copyLocations
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue([
      { lock_status: Date.now(), lock_user_id: 123 },
    ]);
    listUtils.uploadBulkLocations.mockResolvedValue(geojson);

    const result = await moveLocations(
      mockReq,
      srcListId,
      srcLocationIds,
      destListId,
      geojson,
      gfwListId,
      deleteSrcList
    );

    expect(result).toBe(true);
    expect(logger.logActivity).toHaveBeenCalledWith(
      mockReq,
      logger.listActivityTypes.List.LocationMovedFromList,
      expect.stringContaining('source-list')
    );
  });

  test('Should move locations and delete source list', async () => {
    const srcListId = 1;
    const srcLocationIds = [1, 2];
    const destListId = 2;
    const geojson = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { location_id: 1 }, geometry: {} },
        { type: 'Feature', properties: { location_id: 2 }, geometry: {} },
      ],
    };
    const gfwListId = 0;
    const deleteSrcList = true;

    const srcList = { id: srcListId, list_name: 'source-list' };
    const destList = { id: destListId, list_name: 'dest-list' };
    const { DeleteListTypeOrm } = require('@wri-monorepos/sql');

    listUtils.getListNameSchema
      .mockResolvedValueOnce(srcList)
      .mockResolvedValueOnce(destList)
      .mockResolvedValueOnce(srcList); // For deleteList

    const mockDelete = jest.fn().mockResolvedValue(undefined);
    DeleteListTypeOrm.mockImplementation(() => ({
      delete: mockDelete,
    }));

    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue([
      { lock_status: Date.now(), lock_user_id: 123 },
    ]);
    listUtils.uploadBulkLocations.mockResolvedValue(geojson);

    const result = await moveLocations(
      mockReq,
      srcListId,
      srcLocationIds,
      destListId,
      geojson,
      gfwListId,
      deleteSrcList
    );

    expect(result).toBe(true);
    expect(logger.logActivity).toHaveBeenCalledWith(
      mockReq,
      logger.listActivityTypes.List.ListDeleted,
      expect.stringContaining('was deleted due to all locations having been moved')
    );
  });

  test('Should reject when move fails', async () => {
    const error = new Error('Move failed');
    listUtils.getListNameSchema.mockRejectedValue(error);
    errorUtils.createErrorMessage.mockReturnValue({
      code: 'FAILED_TO_MOVE_LOCATIONS',
      message: 'Failed to move locations',
    });

    await expect(
      moveLocations(mockReq, 1, [1], 2, { type: 'FeatureCollection', features: [] }, 0, false)
    ).rejects.toEqual({
      code: 'FAILED_TO_MOVE_LOCATIONS',
      message: 'Failed to move locations',
    });
  });
});


