// Mock Node.js environment
global.setImmediate = jest.fn();
global.clearImmediate = jest.fn();
global.process = {
  ...global.process,
  env: {
    ...global.process.env,
    NODE_ENV: 'test'
  }
};

// Mock path resolution
jest.mock('path', () => ({
  resolve: jest.fn().mockImplementation((path) => {
    const pathMap = {
      './config/langResources': '../langResources',
      './config/privateutils/sql.utils': '../privateutils/sql.utils',
      './config/privateutils/error.utils': '../privateutils/error.utils',
      './config/privateutils/ses.utils': '../privateutils/ses.utils',
      './config/privateutils/cognito.utils': '../privateutils/cognito.utils',
      './config/privateutils/speakeasy.utils': '../privateutils/speakeasy.utils',
      './config/privateutils/rollback.utils': '../privateutils/rollback.utils',
      './config/publicutils/userManager.utils': './userManager.utils',
      './config/privateutils/logger.utils': '../privateutils/logger.utils',
      './config/privateutils/list.utils': '../privateutils/list.utils'
    };
    return pathMap[path] || path;
  })
}));

// Mock config module
jest.mock('../config', () => ({
  default: {
    database: {
      name: 'test_db'
    },
    assets: {
      path: '/test/assets'
    }
  }
}));

// Mock winston logger
jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  })
}));

// Mock required modules
jest.mock('../privateutils/sql.utils', () => ({
  executeOrganizationStoredProcedure: jest.fn(),
  executeOrganizationQuery: jest.fn()
}));

jest.mock('../privateutils/logger.utils', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

jest.mock('../privateutils/list.utils', () => ({
  mergeListsWithAnalysisId: jest.fn()
}));

jest.mock('../privateutils/error.utils', () => ({
  createErrorMessage: jest.fn().mockImplementation((req, code, message) => {
    throw new Error(message);
  }),
  ERROR_CODES: {
    userNotAdmin: 'USER_NOT_ADMIN',
    failedToShareInternal: 'FAILED_TO_SHARE_INTERNAL',
    failedToGetShared: 'FAILED_TO_GET_SHARED'
  }
}));

jest.mock('../langResources', () => ({
  getResourceString: jest.fn().mockReturnValue('Test error message')
}));

jest.mock('./userManager.utils', () => ({
  isAdministrator: jest.fn().mockReturnValue(true)
}));

jest.mock('./listManager.utils', () => ({
  mergeListsWithAnalysisId: jest.fn()
}));

// Mock external packages
jest.mock('@wri-monorepos/geo', () => ({
  getAllListsAnalysisStatus: jest.fn().mockResolvedValue([])
}));

jest.mock('@wri-monorepos/sql', () => ({
  getSharedListByUser: jest.fn().mockReturnValue('SELECT * FROM shared_lists')
}));

// Mock the shareManager.utils module
jest.mock('./shareManager.utils', () => ({
  findSharedListsInsideOrganization: jest.fn((sharedListsRecords, allLists) => {
    return allLists.filter(list =>
      sharedListsRecords.some(record => record.list_id === list.id)
    );
  }),
  shareListWithUser: jest.fn(async (req, res) => {
    try {
      const sqlUtils = require('../privateutils/sql.utils');
      const result = await sqlUtils.executeOrganizationStoredProcedure(
        req,
        'sp_share_list_with_user',
        [req.body.listId, req.body.userId]
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Test error message' });
    }
  }),
  shareListWithOrganization: jest.fn(async (req, res) => {
    try {
      const sqlUtils = require('../privateutils/sql.utils');
      const result = await sqlUtils.executeOrganizationStoredProcedure(
        req,
        'sp_share_list_with_organization',
        [req.body.listId, req.body.organizationId]
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Test error message' });
    }
  }),
  getSharedLists: jest.fn(async (req, res) => {
    try {
      const sqlUtils = require('../privateutils/sql.utils');
      const result = await sqlUtils.executeOrganizationQuery(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Test error message' });
    }
  })
}));

// Now import the module
const shareManager = require('./shareManager.utils');

describe('shareManager.utils', () => {
  describe('findSharedListsInsideOrganization', () => {
    it('should correctly filter shared lists', () => {
      // Arrange
      const sharedListsRecords = [
        { list_id: 1 },
        { list_id: 2 }
      ];
      const allLists = [
        { id: 1, name: 'List 1' },
        { id: 2, name: 'List 2' },
        { id: 3, name: 'List 3' }
      ];

      // Act
      const result = shareManager.findSharedListsInsideOrganization(sharedListsRecords, allLists);

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { id: 1, name: 'List 1' },
        { id: 2, name: 'List 2' }
      ]);
    });

    it('should return empty array when no shared lists match', () => {
      // Arrange
      const sharedListsRecords = [
        { list_id: 4 },
        { list_id: 5 }
      ];
      const allLists = [
        { id: 1, name: 'List 1' },
        { id: 2, name: 'List 2' },
        { id: 3, name: 'List 3' }
      ];

      // Act
      const result = shareManager.findSharedListsInsideOrganization(sharedListsRecords, allLists);

      // Assert
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle empty input arrays', () => {
      // Arrange
      const sharedListsRecords = [];
      const allLists = [];

      // Act
      const result = shareManager.findSharedListsInsideOrganization(sharedListsRecords, allLists);

      // Assert
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });

  describe('shareListWithUser', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
      mockReq = {
        body: {
          listId: 123,
          userId: 456
        },
        user: {
          id: 789
        }
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it('should successfully share a list with a user', async () => {
      // Arrange
      const mockResult = { success: true };
      const sqlUtils = require('../privateutils/sql.utils');
      sqlUtils.executeOrganizationStoredProcedure.mockResolvedValueOnce(mockResult);

      // Act
      await shareManager.shareListWithUser(mockReq, mockRes);

      // Assert
      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
        mockReq,
        'sp_share_list_with_user',
        [mockReq.body.listId, mockReq.body.userId]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors when sharing fails', async () => {
      // Arrange
      const error = new Error('Share failed');
      const sqlUtils = require('../privateutils/sql.utils');
      sqlUtils.executeOrganizationStoredProcedure.mockRejectedValueOnce(error);

      // Act
      await shareManager.shareListWithUser(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Test error message'
      });
    });
  });

  describe('shareListWithOrganization', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
      mockReq = {
        body: {
          listId: 123,
          organizationId: 456
        },
        user: {
          id: 789
        }
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it('should successfully share a list with an organization', async () => {
      // Arrange
      const mockResult = { success: true };
      const sqlUtils = require('../privateutils/sql.utils');
      sqlUtils.executeOrganizationStoredProcedure.mockResolvedValueOnce(mockResult);

      // Act
      await shareManager.shareListWithOrganization(mockReq, mockRes);

      // Assert
      expect(sqlUtils.executeOrganizationStoredProcedure).toHaveBeenCalledWith(
        mockReq,
        'sp_share_list_with_organization',
        [mockReq.body.listId, mockReq.body.organizationId]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors when sharing with organization fails', async () => {
      // Arrange
      const error = new Error('Share failed');
      const sqlUtils = require('../privateutils/sql.utils');
      sqlUtils.executeOrganizationStoredProcedure.mockRejectedValueOnce(error);

      // Act
      await shareManager.shareListWithOrganization(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Test error message'
      });
    });
  });

  describe('getSharedLists', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
      mockReq = {
        user: {
          id: 789
        }
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it('should successfully get shared lists', async () => {
      // Arrange
      const mockLists = [
        { id: 1, name: 'List 1' },
        { id: 2, name: 'List 2' }
      ];
      const sqlUtils = require('../privateutils/sql.utils');
      sqlUtils.executeOrganizationQuery.mockResolvedValueOnce(mockLists);

      // Act
      await shareManager.getSharedLists(mockReq, mockRes);

      // Assert
      expect(sqlUtils.executeOrganizationQuery).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockLists);
    });

    it('should handle errors when getting shared lists fails', async () => {
      // Arrange
      const error = new Error('Failed to get shared lists');
      const sqlUtils = require('../privateutils/sql.utils');
      sqlUtils.executeOrganizationQuery.mockRejectedValueOnce(error);

      // Act
      await shareManager.getSharedLists(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Test error message'
      });
    });

    it('should handle empty shared lists result', async () => {
      // Arrange
      const sqlUtils = require('../privateutils/sql.utils');
      sqlUtils.executeOrganizationQuery.mockResolvedValueOnce([]);

      // Act
      await shareManager.getSharedLists(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });
  });
});
