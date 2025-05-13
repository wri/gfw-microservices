import { jest } from '@jest/globals';
import * as shareManager from './shareManager.utils';
import * as UserManager from './userManager.utils';
import * as sqlUtils from '../privateutils/sql.utils';

// Mock path module
jest.mock('path', () => ({
  resolve: jest.fn().mockImplementation((path) => {
    // Map the paths used in the original file to their actual locations
    const pathMap = {
      './config/langResources': '../langResources',
      './config/privateutils/sql.utils': '../privateutils/sql.utils',
      './config/privateutils/error.utils': '../privateutils/error.utils',
      './config/privateutils/ses.utils': '../privateutils/ses.utils',
      './config/privateutils/cognito.utils': '../privateutils/cognito.utils',
      './config/publicutils/userManager.utils': './userManager.utils',
    };
    return pathMap[path] || path;
  }),
}));

// Mock sqlite3 and sqlite
jest.mock('sqlite3', () => ({
  Database: jest.fn().mockImplementation(() => ({
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn(),
    close: jest.fn(),
  })),
}));

jest.mock('sqlite', () => ({
  open: jest.fn().mockResolvedValue({
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn(),
    close: jest.fn(),
  }),
}));

// Mock mssql
jest.mock('mssql', () => ({
  Int: 'Int',
  DateTime: 'DateTime',
  VarChar: 'VarChar',
}));

// Mock global Node.js functions
global.setImmediate = jest.fn();
global.clearImmediate = jest.fn();

// Mock winston logger
jest.mock('winston', () => {
  const mockConsole = jest.fn();
  return {
    createLogger: jest.fn().mockReturnValue({
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    }),
    transports: {
      Console: jest.fn().mockImplementation(() => mockConsole),
    },
  };
});

// Mock dependencies
jest.mock('./userManager.utils');
jest.mock('./listManager.utils', () => ({
  mergeListsWithAnalysisId: jest.fn(),
}));
jest.mock('../privateutils/sql.utils');
jest.mock('../privateutils/logger.utils', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));
jest.mock('../privateutils/list.utils', () => ({
  mergeListsWithAnalysisId: jest.fn(),
}));
jest.mock('../privateutils/error.utils', () => ({
  createErrorMessage: jest.fn().mockImplementation((req, code, message) => {
    throw new Error(message);
  }),
  ERROR_CODES: {
    userNotAdmin: 'USER_NOT_ADMIN',
    failedToShareInternal: 'FAILED_TO_SHARE_INTERNAL',
    failedToGetShared: 'FAILED_TO_GET_SHARED',
  },
}));
jest.mock('../privateutils/ses.utils', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));
jest.mock('../privateutils/cognito.utils', () => ({
  createUser: jest.fn().mockResolvedValue(true),
  deleteUser: jest.fn().mockResolvedValue(true),
  updateUserAttributes: jest.fn().mockResolvedValue(true),
}));
jest.mock('../langResources', () => ({
  getResourceString: jest.fn().mockReturnValue('Test error message'),
}));
jest.mock('@wri-monorepos/geo', () => ({
  getAllListsAnalysisStatus: jest.fn().mockResolvedValue([]),
}));
jest.mock('@wri-monorepos/sql', () => ({
  getSharedListByUser: jest.fn().mockReturnValue('SELECT * FROM shared_lists'),
}));

describe('shareManager.utils', () => {
  let mockReq;
  let mockError;

  beforeEach(() => {
    mockReq = {
      session: {
        organization_database: 'test_db',
      },
    };
    mockError = new Error('Test error');

    // Reset all mocks
    jest.clearAllMocks();

    // Default mock implementations
    UserManager.isAdministrator.mockReturnValue(true);
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(true);
    sqlUtils.executeOrganizationQuery.mockResolvedValue([]);
  });

  describe('shareInternalList', () => {
    it('should successfully share a list when user is admin', async () => {
      const result = await shareManager.shareInternalList(mockReq, 1, 2, 3);
      expect(result).toBe(true);
      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
        mockReq,
        'uspShareInternalList',
        expect.any(Array)
      );
    });

    it('should throw error when user is not admin', async () => {
      UserManager.isAdministrator.mockReturnValue(false);
      await expect(shareManager.shareInternalList(mockReq, 1, 2, 3)).rejects.toThrow();
    });

    it('should throw error when database operation fails', async () => {
      sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(mockError);
      await expect(shareManager.shareInternalList(mockReq, 1, 2, 3)).rejects.toThrow();
    });
  });

  describe('activateShareInternalList', () => {
    it('should successfully activate a shared list', async () => {
      const result = await shareManager.activateShareInternalList(mockReq, 1, 2, 3, new Date());
      expect(result).toBe(true);
      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
        mockReq,
        'uspActivateShareInternalList',
        expect.any(Array)
      );
    });

    it('should throw error when database operation fails', async () => {
      sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(mockError);
      await expect(
        shareManager.activateShareInternalList(mockReq, 1, 2, 3, new Date())
      ).rejects.toThrow();
    });
  });

  describe('deactivateShareInternalList', () => {
    it('should successfully deactivate a shared list when user is admin', async () => {
      const result = await shareManager.deactivateShareInternalList(mockReq, 1, 2);
      expect(result).toBe(true);
      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
        mockReq,
        'uspDeactivateShareInternalList',
        expect.any(Array)
      );
    });

    it('should throw error when user is not admin', async () => {
      UserManager.isAdministrator.mockReturnValue(false);
      await expect(shareManager.deactivateShareInternalList(mockReq, 1, 2)).rejects.toThrow();
    });
  });

  describe('getUserInternalShareLists', () => {
    it('should successfully get user shared lists', async () => {
      const mockLists = [{ id: 1 }, { id: 2 }];
      sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockLists);

      const result = await shareManager.getUserInternalShareLists(mockReq, 1);
      expect(result).toEqual(mockLists);
      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
        mockReq,
        'uspGetUserInternalShareLists',
        expect.any(Array)
      );
    });

    it('should throw error when database operation fails', async () => {
      sqlUtils.executeOrganizationStoredProcedure.mockRejectedValue(mockError);
      await expect(shareManager.getUserInternalShareLists(mockReq, 1)).rejects.toThrow();
    });
  });

  describe('getSharedListDataByUser', () => {
    it('should successfully get shared list data', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      sqlUtils.executeOrganizationQuery.mockResolvedValue(mockData);

      const result = await shareManager.getSharedListDataByUser(mockReq, 1);
      expect(result).toEqual(mockData);
    });

    it('should throw error when database operation fails', async () => {
      sqlUtils.executeOrganizationQuery.mockRejectedValue(mockError);
      await expect(shareManager.getSharedListDataByUser(mockReq, 1)).rejects.toThrow();
    });
  });

  describe('getAdminInternalLists', () => {
    it('should successfully get admin internal lists', async () => {
      const mockLists = [{ id: 1 }, { id: 2 }];
      sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue(mockLists);

      const result = await shareManager.getAdminInternalLists(mockReq);
      expect(result).toEqual(mockLists);
    });

    it('should throw error when user is not admin', async () => {
      UserManager.isAdministrator.mockReturnValue(false);
      await expect(shareManager.getAdminInternalLists(mockReq)).rejects.toThrow();
    });
  });

  describe('findSharedListsInsideOrganization', () => {
    it('should correctly filter shared lists', () => {
      const sharedListsRecords = [{ list_id: 1 }, { list_id: 2 }];
      const allLists = [
        { id: 1, name: 'List 1' },
        { id: 2, name: 'List 2' },
        { id: 3, name: 'List 3' },
      ];

      const result = shareManager.findSharedListsInsideOrganization(sharedListsRecords, allLists);
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { id: 1, name: 'List 1' },
        { id: 2, name: 'List 2' },
      ]);
    });
  });
});
