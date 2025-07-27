import { CreateListLevelData } from './create.list.level.data';
import { SQLUtils } from '@wri-monorepos/sql';
import { CreateListResult } from '@wri-monorepos/geo';
import * as sql from 'mssql';
import { Logger } from '@nestjs/common';
import { listStatus } from '@wri-monorepos/constants';

import { ChainType, RequestNewList } from './types';

jest.mock('@wri-monorepos/sql');
jest.mock('../shared/update.lists.upload.status', () => ({
  updateListsUploadStatus: jest.fn(),
}));

describe('CreateListLevelData', () => {
  let createListLevelData: CreateListLevelData;
  let mockConnection: jest.Mocked<SQLUtils>;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    mockConnection = new SQLUtils({} as sql.config) as jest.Mocked<SQLUtils>;
    createListLevelData = new CreateListLevelData();

    // Mock the Logger
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    // Mock connection methods
    mockConnection.connect = jest.fn();
    mockConnection.disconnect = jest.fn();
    mockConnection.executeQuery = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSqlParameter', () => {
    it('should create SQL parameter with correct structure', () => {
      const result = (createListLevelData as any).createSqlParameter('test_field', sql.Int, 123);

      expect(result).toEqual({
        field: 'test_field',
        type: sql.Int,
        value: 123,
      });
    });

    it('should handle string values', () => {
      const result = (createListLevelData as any).createSqlParameter(
        'name',
        sql.NVarChar(50),
        'test'
      );

      expect(result).toEqual({
        field: 'name',
        type: sql.NVarChar(50),
        value: 'test',
      });
    });
  });

  describe('executeQueryWithParams', () => {
    it('should execute query successfully', async () => {
      const mockResult = { success: true };
      mockConnection.executeQuery.mockResolvedValue(mockResult);

      const parameters = [{ field: 'test', type: sql.Int, value: 1 }];

      const result = await (createListLevelData as any).executeQueryWithParams(
        mockConnection,
        'testProcedure',
        parameters
      );

      expect(result).toEqual(mockResult);
      expect(mockConnection.executeQuery).toHaveBeenCalledWith('testProcedure', parameters);
    });

    it('should throw formatted error when query fails', async () => {
      const originalError = new Error('Database connection failed');
      mockConnection.executeQuery.mockRejectedValue(originalError);

      const parameters = [{ field: 'test', type: sql.Int, value: 1 }];

      await expect(
        (createListLevelData as any).executeQueryWithParams(
          mockConnection,
          'testProcedure',
          parameters
        )
      ).rejects.toThrow('Failed to execute testProcedure: Database connection failed');
    });
  });

  describe('insertListInListTable', () => {
    it('should insert a list with all required parameters', async () => {
      const mockResult: CreateListResult = { list_id: 123 } as CreateListResult;
      mockConnection.executeQuery.mockResolvedValue(mockResult);

      const result = await createListLevelData.insertListInListTable(
        mockConnection,
        1, // userId
        'Test List', // listName
        'test_list_table', // listTable
        'test_analysis_table', // analysisTable
        1, // listStatusId
        'point', // locationClassification
        'attr1,attr2', // customAttributeNames
        'string,number', // customAttributeTypes
        5, // gfwListId
        'palm_oil' // commodity
      );

      expect(result).toEqual(mockResult);
      expect(mockConnection.executeQuery).toHaveBeenCalledWith(
        'uspCreateList',
        expect.arrayContaining([
          expect.objectContaining({ field: 'user_id', value: 1 }),
          expect.objectContaining({ field: 'template_id', value: 2 }),
          expect.objectContaining({ field: 'list_name', value: 'Test List' }),
          expect.objectContaining({ field: 'list_table_name', value: 'test_list_table' }),
          expect.objectContaining({
            field: 'list_analysis_table_name',
            value: 'test_analysis_table',
          }),
          expect.objectContaining({ field: 'list_status_id', value: 1 }),
          expect.objectContaining({ field: 'location_classification', value: 'point' }),
          expect.objectContaining({ field: 'custom_attribute_names', value: 'attr1,attr2' }),
          expect.objectContaining({ field: 'custom_attribute_types', value: 'string,number' }),
          expect.objectContaining({ field: 'associated_gfwlist', value: 5 }),
          expect.objectContaining({ field: 'commodity', value: 'palm_oil' }),
          expect.objectContaining({ field: 'version', value: 2 }),
        ])
      );
    });

    it('should handle null gfwListId and commodity', async () => {
      const mockResult: CreateListResult = { list_id: 456 } as CreateListResult;
      mockConnection.executeQuery.mockResolvedValue(mockResult);

      const result = await createListLevelData.insertListInListTable(
        mockConnection,
        1, // userId
        2, // templateId
        'Test List', // listName
        'test_list_table', // listTable
        'test_analysis_table', // analysisTable
        1, // listStatusId
        'polygon', // locationClassification
        '', // customAttributeNames
        '', // customAttributeTypes
        null, // gfwListId
        null // commodity
      );

      expect(result).toEqual(mockResult);
      expect(mockConnection.executeQuery).toHaveBeenCalledWith(
        'uspCreateList',
        expect.arrayContaining([
          expect.objectContaining({ field: 'associated_gfwlist', value: null }),
          expect.objectContaining({ field: 'commodity', value: null }),
        ])
      );
    });

    it('should throw an error if the query fails', async () => {
      mockConnection.executeQuery.mockRejectedValue(new Error('Query failed'));

      await expect(
        createList.insertListInListTable(
          mockConnection as SQLUtils,
          1, // userId
          'Test List', // listName
          'test_list_table', // listTable
          'test_analysis_table', // analysisTable
          1, // listStatusId
          'classification', // locationClassification
          'attr_names', // customAttributeNames
          'attr_types', // customAttributeTypes
          1, // gfwListId
          false // isUploadListLpFlagEnabled
        )
      ).rejects.toThrow('Failed to execute uspCreateList: Query failed');
    });
  });

  describe('addListToAnalysesTable', () => {
    it('should add a list to the analyses table', async () => {
      mockConnection.executeQuery.mockResolvedValue(undefined);

      await createListLevelData.addListToAnalysesTable(mockConnection, 123);

      expect(mockConnection.executeQuery).toHaveBeenCalledWith(
        'uspAddListToAnalyses',
        expect.arrayContaining([expect.objectContaining({ field: 'list_id', value: 123 })])
      );
    });

    it('should throw an error if the query fails', async () => {
      mockConnection.executeQuery.mockRejectedValue(new Error('Analysis table update failed'));

      await expect(createListLevelData.addListToAnalysesTable(mockConnection, 123)).rejects.toThrow(
        'Failed to execute uspAddListToAnalyses: Analysis table update failed'
      );
    });
  });

  describe('handle', () => {
    it('should handle the input and perform all operations', async () => {
      const mockInput: ChainType = {
        request: {
          list_name: 'Test List',
          organization_database: 'test_db',
          listTable: 'test_list_table',
          analysisTable: 'test_analysis_table',
          saveAsDraft: false,
          locationClassification: 'classification',
          customAttributeNames: 'attr_names',
          customAttributeTypes: 'attr_types',
          gfwListId: 1,
          user_id: 1,
          path: 'test_path',
        },
      };
      const mockFeatureFlag: Partial<FeatureFlag> = {
        flagId: 'UploadListLp',
        flagState: false,
      };

      const mockResult: CreateListResult = { list_id: 1 } as CreateListResult;

      jest.spyOn(SQLUtils, 'queryDB').mockResolvedValue({ orgId: 123 });

      jest.spyOn(SQLUtils.prototype, 'connect').mockImplementation(function (databaseName) {
        this.databaseName = databaseName; // Set databaseName for use in updateListsUploadStatus
        return Promise.resolve();
      });
      jest.spyOn(SQLUtils.prototype, 'disconnect').mockResolvedValue(undefined);

      const insertListInListTableSpy = jest
        .spyOn(createList, 'insertListInListTable')
        .mockResolvedValue(mockResult);

      jest.spyOn(createList, 'addListToAnalysesTable').mockResolvedValue(undefined);

      (featureFlagsService as jest.Mock).mockImplementation(async () => {
        return {
          getClientIdByClientStoreDatabaseName: jest.fn().mockResolvedValue(123),
          getFeatureFlagsForCurrentOrg: jest.fn().mockResolvedValue([mockFeatureFlag]),
        };
      });

      await createList.handle(mockInput);

      expect(featureFlagsService).toHaveBeenCalled();

      expect(insertListInListTableSpy).toHaveBeenCalledWith(
        expect.any(SQLUtils), // connection instance
        1, // userId
        'Test List', // listName (no templateId anymore)
        'test_list_table', // listTable
        'test_analysis_table', // analysisTable
        1, // listStatusId
        'classification', // locationClassification
        'attr_names', // customAttributeNames
        'attr_types', // customAttributeTypes
        1, // gfwListId
        false, // isUploadListLpFlagEnabled
        ''
      );
    });

    it('should handle successful list creation with saveAsDraft=false', async () => {
      const mockInput: ChainType = {
        request: {
          ...baseRequest,
          saveAsDraft: false,
          locationClassification: 'classification',
          customAttributeNames: 'attr_names',
          customAttributeTypes: 'attr_types',
          gfwListId: 1,
          user_id: 1,
          path: 'test_path',
        },
      };

      const mockCreateResult: CreateListResult = { list_id: 789 } as CreateListResult;
      mockConnection.executeQuery.mockResolvedValue(mockCreateResult);

      const result = await createListLevelData.handle(mockInput);

      expect(mockConnection.connect).toHaveBeenCalledWith('test_db');
      expect(mockConnection.executeQuery).toHaveBeenCalledTimes(2); // Create list + add to analyses
      expect(mockConnection.disconnect).toHaveBeenCalled();

      expect(loggerSpy).toHaveBeenCalledWith('List created with id: 789 in test_db');
      expect(loggerSpy).toHaveBeenCalledWith('Add list to analysis table: 789 in test_db');

      expect(result).toEqual({
        ...mockInput,
        request: {
          ...mockInput.request,
          list_id: 789,
        } as RequestNewList,
      });
    });

    it('should handle successful list creation with saveAsDraft=true', async () => {
      const mockInput: ChainType = {
        request: {
          ...baseRequest,
          saveAsDraft: true,
          gfwListId: null,
          commodity: undefined,
        },
      };

      const mockCreateResult: CreateListResult = { list_id: 101 } as CreateListResult;
      mockConnection.executeQuery.mockResolvedValue(mockCreateResult);

      const result = await createListLevelData.handle(mockInput);

      // Verify that Draft status was used
      expect(mockConnection.executeQuery).toHaveBeenNthCalledWith(
        1,
        'uspCreateList',
        expect.arrayContaining([
          expect.objectContaining({ field: 'list_status_id', value: listStatus.Draft }),
        ])
      );

      expect((result.request as RequestNewList).list_id).toBe(101);
    });

    it('should handle list creation without optional parameters', async () => {
      const mockInput: ChainType = {
        request: {
          ...baseRequest,
          saveAsDraft: false,
          // No gfwListId, commodity will default to empty string
        },
      };

      const mockCreateResult: CreateListResult = { list_id: 202 } as CreateListResult;
      mockConnection.executeQuery.mockResolvedValue(mockCreateResult);

      const result = await createListLevelData.handle(mockInput);

      expect(mockConnection.executeQuery).toHaveBeenNthCalledWith(
        1,
        'uspCreateList',
        expect.arrayContaining([
          expect.objectContaining({ field: 'list_status_id', value: listStatus.Pending }),
          expect.objectContaining({ field: 'commodity', value: '' }),
        ])
      );

      expect((result.request as RequestNewList).list_id).toBe(202);
    });

    it('should disconnect even when insertListInListTable fails', async () => {
      const mockInput: ChainType = {
        request: {
          ...baseRequest,
          saveAsDraft: false,
        },
      };

      mockConnection.executeQuery.mockRejectedValue(new Error('Insert failed'));

      await expect(createListLevelData.handle(mockInput)).rejects.toThrow('Insert failed');

      expect(mockConnection.connect).toHaveBeenCalledWith('test_db');
      expect(mockConnection.disconnect).toHaveBeenCalled();
    });

    it('should disconnect even when addListToAnalysesTable fails', async () => {
      const mockInput: ChainType = {
        request: {
          ...baseRequest,
          saveAsDraft: false,
        },
      };

      const mockCreateResult: CreateListResult = { list_id: 303 } as CreateListResult;
      mockConnection.executeQuery
        .mockResolvedValueOnce(mockCreateResult) // First call succeeds
        .mockRejectedValueOnce(new Error('Analysis table failed')); // Second call fails

      await expect(createListLevelData.handle(mockInput)).rejects.toThrow('Analysis table failed');

      expect(mockConnection.connect).toHaveBeenCalledWith('test_db');
      expect(mockConnection.disconnect).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('List created with id: 303 in test_db');
    });

    it('should disconnect even when connection fails', async () => {
      const mockInput: ChainType = {
        request: {
          ...baseRequest,
          saveAsDraft: false,
        },
      };

      mockConnection.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(createListLevelData.handle(mockInput)).rejects.toThrow('Connection failed');

      expect(mockConnection.disconnect).toHaveBeenCalled();
    });
  });
});
