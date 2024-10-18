import { CreateListLevelData } from './create.list.level.data';
import { FeatureFlag, SQLUtils } from '@wri-monorepos/sql';
import { updateListsUploadStatus } from '../shared/update.lists.upload.status';
import { CreateListResult } from '@wri-monorepos/geo';
import * as sql from 'mssql';
import { featureFlagsService } from '@wri-monorepos/shared';

import { ChainType } from './types';

jest.mock('@wri-monorepos/sql');
jest.mock('../shared/update.lists.upload.status', () => ({
  updateListsUploadStatus: jest.fn(),
}));
jest.mock('@wri-monorepos/shared', () => ({
  featureFlagsService: jest.fn(),
}));

describe('CreateList', () => {
  let createList: CreateListLevelData;
  let mockConnection: jest.Mocked<SQLUtils>;

  beforeEach(() => {
    mockConnection = new SQLUtils({} as sql.config) as jest.Mocked<SQLUtils>;
    createList = new CreateListLevelData();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insertListInListTable', () => {
    let createList: CreateListLevelData;
    let mockConnection: any;
    let mockFeatureFlagsService: any;

    beforeEach(() => {
      createList = new CreateListLevelData();
      mockConnection = {
        executeQuery: jest.fn(),
      };

      const mockFeatureFlags: FeatureFlag[] = [
        { flagId: 'UploadListLp', flagState: true } as FeatureFlag,
      ];

      mockFeatureFlagsService = {
        getFeatureFlagsForCurrentOrg: jest.fn().mockResolvedValue(mockFeatureFlags),
      };

      (featureFlagsService as jest.Mock).mockResolvedValue(mockFeatureFlagsService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should insert a list in the list table and return the result', async () => {
      const mockResult: CreateListResult = { list_id: 1 } as CreateListResult;
      mockConnection.executeQuery.mockResolvedValue(mockResult);

      const result = await createList.insertListInListTable(
        mockConnection,
        1, // userId
        1, // templateId
        'Test List', // listName
        'test_list_table', // listTable
        'test_analysis_table', // analysisTable
        1, // listStatusId
        'classification', // locationClassification
        'attr_names', // customAttributeNames
        'attr_types', // customAttributeTypes
        1, // gfwListId
        1 // orgId
      );

      expect(result).toEqual(mockResult);
      expect(mockConnection.executeQuery).toHaveBeenCalledWith('uspCreateList', expect.any(Array));

      expect(featureFlagsService).toHaveBeenCalled();
      expect(mockFeatureFlagsService.getFeatureFlagsForCurrentOrg).toHaveBeenCalledWith(1); // orgId
    });

    it('should throw an error if the query fails', async () => {
      mockConnection.executeQuery.mockRejectedValue(new Error('Query failed'));

      await expect(
        createList.insertListInListTable(
          mockConnection,
          1, // userId
          1, // templateId
          'Test List', // listName
          'test_list_table', // listTable
          'test_analysis_table', // analysisTable
          1, // listStatusId
          'classification', // locationClassification
          'attr_names', // customAttributeNames
          'attr_types', // customAttributeTypes
          1, // gfwListId
          1 // orgId
        )
      ).rejects.toThrow('Failed to execute uspCreateList: Query failed');

      expect(featureFlagsService).toHaveBeenCalled();
      expect(mockFeatureFlagsService.getFeatureFlagsForCurrentOrg).toHaveBeenCalledWith(1); // orgId
    });
  });

  describe('addListToAnalysesTable', () => {
    it('should add a list to the analyses table', async () => {
      mockConnection.executeQuery.mockResolvedValue(undefined);

      await createList.addListToAnalysesTable(mockConnection, 1);

      expect(mockConnection.executeQuery).toHaveBeenCalledWith(
        'uspAddListToAnalyses',
        expect.any(Array)
      );
    });

    it('should throw an error if the query fails', async () => {
      mockConnection.executeQuery.mockRejectedValue(new Error('Query failed'));

      await expect(createList.addListToAnalysesTable(mockConnection, 1)).rejects.toThrow();
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
          listStatusId: 1,
          locationClassification: 'classification',
          customAttributeNames: 'attr_names',
          customAttributeTypes: 'attr_types',
          gfwListId: 1,
          user_id: 1,
          template_id: 1,
          path: 'test_path',
        },
      };

      const mockResult: CreateListResult = { list_id: 1 } as CreateListResult;

      // Mock SQLUtils.queryDB to return orgId
      jest.spyOn(SQLUtils, 'queryDB').mockResolvedValue({ orgId: 123 });

      // Mock SQLUtils instance methods
      jest.spyOn(SQLUtils.prototype, 'connect').mockImplementation(function (databaseName) {
        this.databaseName = databaseName; // Set databaseName for use in updateListsUploadStatus
        return Promise.resolve();
      });
      jest.spyOn(SQLUtils.prototype, 'disconnect').mockResolvedValue(undefined);

      // Mock insertListInListTable method
      const insertListInListTableSpy = jest
        .spyOn(createList, 'insertListInListTable')
        .mockResolvedValue(mockResult);

      // Mock addListToAnalysesTable method
      jest.spyOn(createList, 'addListToAnalysesTable').mockResolvedValue(undefined);

      await createList.handle(mockInput);

      expect(insertListInListTableSpy).toHaveBeenCalledWith(
        expect.any(SQLUtils), // connection instance
        1, // userId
        1, // templateId
        'Test List', // listName
        'test_list_table', // listTable
        'test_analysis_table', // analysisTable
        1, // listStatusId
        'classification', // locationClassification
        'attr_names', // customAttributeNames
        'attr_types', // customAttributeTypes
        1, // gfwListId
        123 // orgId
      );

      expect(updateListsUploadStatus).toHaveBeenCalledWith(
        'test_db', // databaseName from the mocked connection
        1, // list_id
        'Insert row in List table'
      );
      expect(updateListsUploadStatus).toHaveBeenCalledWith(
        'test_db',
        1,
        'Add list to analysis table'
      );
    });

    it('should disconnect the connection even if an error occurs', async () => {
      const mockInput: ChainType = {
        request: {
          list_name: 'Test List',
          organization_database: 'test_db',
          listTable: 'test_list_table',
          analysisTable: 'test_analysis_table',
          listStatusId: 1,
          locationClassification: 'classification',
          customAttributeNames: 'attr_names',
          customAttributeTypes: 'attr_types',
          gfwListId: 1,
          user_id: 1,
          template_id: 1,
          path: 'test_path',
        },
      };

      jest.spyOn(createList, 'insertListInListTable').mockRejectedValue(new Error('Query failed'));

      await expect(createList.handle(mockInput)).rejects.toThrow('Query failed');
    });
  });
});
