import { CreateLocationSchema } from './create.location.schema';
import { ClientStoreConnection, SQLUtils } from '@wri-monorepos/sql';
import { updateListsUploadStatus } from '../shared/update.lists.upload.status';
import { ChainType } from './types';
import { DataSource } from 'typeorm';
import * as sql from 'mssql';

// Mock dependencies
jest.mock('@wri-monorepos/sql');
jest.mock('../shared/update.lists.upload.status');

describe('CreateLocationSchema', () => {
  let createLocationSchema: CreateLocationSchema;
  let mockClientStoreConnection: jest.Mocked<ClientStoreConnection>;
  let mockConnection: jest.Mocked<SQLUtils>;

  beforeEach(() => {
    mockClientStoreConnection = {
      getConnection: jest.fn(),
    } as unknown as jest.Mocked<ClientStoreConnection>;

    mockConnection = new SQLUtils({} as sql.config) as jest.Mocked<SQLUtils>;

    createLocationSchema = new CreateLocationSchema(mockClientStoreConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createListTableInDatabase', () => {
    it('should create a list table in the database', async () => {
      mockConnection.executeQuery.mockResolvedValue(undefined);

      await createLocationSchema.createListTableInDatabase(
        mockConnection,
        'test_table',
        'CREATE TABLE test_table (...)'
      );

      expect(mockConnection.executeQuery).toHaveBeenCalledWith(
        'uspCreateListTable',
        expect.any(Array)
      );
    });

    it('should throw an error if the query fails', async () => {
      mockConnection.executeQuery.mockRejectedValue(new Error('Query failed'));

      await expect(
        createLocationSchema.createListTableInDatabase(
          mockConnection,
          'test_table',
          'CREATE TABLE test_table (...)'
        )
      ).rejects.toThrow('Failed to execute uspCreateListTable: Query failed');
    });
  });

  describe('getTableStructureQuery', () => {
    it('should get the table structure query', async () => {
      const mockQueryResult = [{ query_string: 'CREATE TABLE test_table (...)' }];
      const mockQueryRunner = {
        connect: jest.fn(),
        query: jest.fn().mockResolvedValue(mockQueryResult),
      };
      const mockDataSource: Partial<DataSource> = {
        createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
        initialize: jest.fn(),
        destroy: jest.fn(),
        isInitialized: true,
      };
      mockClientStoreConnection.getConnection.mockResolvedValue(mockDataSource as DataSource);

      const result = await createLocationSchema.getTableStructureQuery(1);

      expect(result).toEqual(mockQueryResult);
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.query).toHaveBeenCalledWith('uspGetTableQueryString @0', [1]);
    });

    it('should throw an error if the query fails', async () => {
      const mockQueryRunner = {
        connect: jest.fn(),
        query: jest.fn().mockRejectedValue(new Error('Query failed')),
      };
      const mockDataSource: Partial<DataSource> = {
        createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
        initialize: jest.fn(),
        destroy: jest.fn(),
        isInitialized: true,
      };
      mockClientStoreConnection.getConnection.mockResolvedValue(mockDataSource as DataSource);

      await expect(createLocationSchema.getTableStructureQuery(1)).rejects.toThrow(
        'Failed to get table structure query: Query failed'
      );
    });
  });

  describe('createAnalysisTableInDatabase', () => {
    it('should create an analysis table in the database', async () => {
      mockConnection.executeQuery.mockResolvedValue(undefined);

      await createLocationSchema.createAnalysisTableInDatabase(
        mockConnection,
        'test_analysis_table'
      );

      expect(mockConnection.executeQuery).toHaveBeenCalledWith(
        'uspCreateAnalysisTable',
        expect.any(Array)
      );
    });

    it('should throw an error if the query fails', async () => {
      mockConnection.executeQuery.mockRejectedValue(new Error('Query failed'));

      await expect(
        createLocationSchema.createAnalysisTableInDatabase(mockConnection, 'test_analysis_table')
      ).rejects.toThrow('Failed to execute uspCreateAnalysisTable: Query failed');
    });
  });

  describe('createAnalysisStatusRecords', () => {
    it('should create analysis status records', async () => {
      SQLUtils.queryDB = jest.fn().mockResolvedValue(undefined);

      await createLocationSchema.createAnalysisStatusRecords('test_db', 1, 1, [
        'analysis1',
        'analysis2',
      ]);

      expect(SQLUtils.queryDB).toHaveBeenCalledTimes(2);
      expect(SQLUtils.queryDB).toHaveBeenCalledWith(
        'test_db',
        'uspCreateListAnalysisStatus',
        expect.any(Array)
      );
    });

    it('should throw an error if the query fails', async () => {
      SQLUtils.queryDB = jest.fn().mockRejectedValue(new Error('Query failed'));

      await expect(
        createLocationSchema.createAnalysisStatusRecords('test_db', 1, 1, [
          'analysis1',
          'analysis2',
        ])
      ).rejects.toThrow('Failed to create analysis status records: Query failed');
    });
  });

  describe('handle', () => {
    it('should handle the input and perform all operations', async () => {
      const mockInput: ChainType = {
        request: {
          userId: 1,
          path: 'createLocationSchema',
          list_name: 'test_table',
          templateId: 1,
          listId: 1,
          listTable: 'test_list_table',
          organization_database: 'test_db',
          analysisTable: 'test_analysis_table',
          listStatusId: 1,
          analysisIds: ['analysis1', 'analysis2'],
        },
      };
      const mockQueryResult = [{ query_string: 'CREATE TABLE test_table (...)' }];
      const mockQueryRunner = {
        connect: jest.fn(),
        query: jest.fn().mockResolvedValue(mockQueryResult),
      };
      const mockDataSource: Partial<DataSource> = {
        createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
        initialize: jest.fn(),
        destroy: jest.fn(),
        isInitialized: true,
      };
      mockClientStoreConnection.getConnection.mockResolvedValue(mockDataSource as DataSource);
      mockConnection.executeQuery.mockResolvedValue(undefined);

      // Mock the createListTableInDatabase method
      const createListTableInDatabaseSpy = jest
        .spyOn(createLocationSchema, 'createListTableInDatabase')
        .mockResolvedValue(undefined);

      // Mock the getTableStructureQuery method
      const getTableStructureQuerySpy = jest
        .spyOn(createLocationSchema, 'getTableStructureQuery')
        .mockResolvedValue(mockQueryResult);

      // Mock the createAnalysisTableInDatabase method
      const createAnalysisTableInDatabaseSpy = jest
        .spyOn(createLocationSchema, 'createAnalysisTableInDatabase')
        .mockResolvedValue(undefined);

      // Mock the createAnalysisStatusRecords method
      const createAnalysisStatusRecordsSpy = jest
        .spyOn(createLocationSchema, 'createAnalysisStatusRecords')
        .mockResolvedValue(undefined);

      // Mock the updateListsUploadStatus function

      await createLocationSchema.handle(mockInput);

      expect(createListTableInDatabaseSpy).toHaveBeenCalled();
      expect(getTableStructureQuerySpy).toHaveBeenCalledWith(1);
      expect(createAnalysisTableInDatabaseSpy).toHaveBeenCalled();
      expect(createAnalysisStatusRecordsSpy).toHaveBeenCalledWith('test_db', 1, 1, [
        'analysis1',
        'analysis2',
      ]);
      expect(updateListsUploadStatus).toHaveBeenCalledWith(
        undefined,
        1,
        'Get table query structure'
      );
      expect(updateListsUploadStatus).toHaveBeenCalledWith(undefined, 1, 'Create analysis table');
      expect(updateListsUploadStatus).toHaveBeenCalledWith(
        'test_db',
        1,
        'Create analysis status records'
      );
    });

    it('should disconnect the connection even if an error occurs', async () => {
      const mockInput: ChainType = {
        request: {
          userId: 1,
          path: 'createLocationSchema',
          list_name: 'test_table',
          templateId: 1,
          listId: 1,
          listTable: 'test_list_table',
          organization_database: 'test_db',
          analysisTable: 'test_analysis_table',
          listStatusId: 1,
          analysisIds: ['analysis1', 'analysis2'],
        },
      };
      const mockQueryResult = [{ query_string: 'CREATE TABLE test_table (...)' }];
      const mockQueryRunner = {
        connect: jest.fn(),
        query: jest.fn().mockResolvedValue(mockQueryResult),
      };
      const mockDataSource: Partial<DataSource> = {
        createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
        initialize: jest.fn(),
        destroy: jest.fn(),
        isInitialized: true,
      };
      mockClientStoreConnection.getConnection.mockResolvedValue(mockDataSource as DataSource);
      mockConnection.executeQuery.mockRejectedValue(new Error('Query failed'));

      // Mock the createListTableInDatabase method
      const createListTableInDatabaseSpy = jest
        .spyOn(createLocationSchema, 'createListTableInDatabase')
        .mockRejectedValue(new Error('Query failed'));

      // Mock the getTableStructureQuery method
      const getTableStructureQuerySpy = jest
        .spyOn(createLocationSchema, 'getTableStructureQuery')
        .mockResolvedValue(mockQueryResult);

      // Mock the createAnalysisTableInDatabase method
      const createAnalysisTableInDatabaseSpy = jest
        .spyOn(createLocationSchema, 'createAnalysisTableInDatabase')
        .mockResolvedValue(undefined);

      // Mock the createAnalysisStatusRecords method
      const createAnalysisStatusRecordsSpy = jest
        .spyOn(createLocationSchema, 'createAnalysisStatusRecords')
        .mockResolvedValue(undefined);

      jest.spyOn(mockConnection, 'connect').mockRejectedValue(new Error('Query failed'));
      await expect(createLocationSchema.handle(mockInput)).rejects.toThrow('Query failed');

      expect(createListTableInDatabaseSpy).toHaveBeenCalled();
      expect(getTableStructureQuerySpy).toHaveBeenCalled();
      expect(createAnalysisTableInDatabaseSpy).not.toHaveBeenCalled();
      expect(createAnalysisStatusRecordsSpy).not.toHaveBeenCalled();
      expect(updateListsUploadStatus).toHaveBeenCalled();
    });
  });
});
