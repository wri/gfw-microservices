import { CreateListLevelData } from './create.list.level.data';
import { SQLUtils } from '@wri-monorepos/sql';
import { updateListsUploadStatus } from '../shared/update.lists.upload.status';
import { CreateListResult } from '@wri-monorepos/geo';
import * as sql from 'mssql';

import { ChainType } from './types';

// Mock dependencies
jest.mock('@wri-monorepos/sql');
jest.mock('../shared/update.lists.upload.status');

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
    it('should insert a list in the list table and return the result', async () => {
      const mockResult: CreateListResult = { list_id: 1 } as CreateListResult;
      mockConnection.executeQuery.mockResolvedValue(mockResult);

      const result = await createList.insertListInListTable(
        mockConnection,
        1,
        1,
        'Test List',
        'test_list_table',
        'test_analysis_table',
        1,
        'classification',
        'attr_names',
        'attr_types',
        1
      );

      expect(result).toEqual(mockResult);
      expect(mockConnection.executeQuery).toHaveBeenCalledWith('uspCreateList', expect.any(Array));
    });

    it('should throw an error if the query fails', async () => {
      mockConnection.executeQuery.mockRejectedValue(new Error('Query failed'));

      await expect(
        createList.insertListInListTable(
          mockConnection,
          1,
          1,
          'Test List',
          'test_list_table',
          'test_analysis_table',
          1,
          'classification',
          'attr_names',
          'attr_types',
          1
        )
      ).rejects.toThrow('Failed to execute uspCreateList: Query failed');
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
          userId: 1,
          templateId: 1,
          path: 'test_path',
        },
      };
      const mockResult: CreateListResult = { list_id: 1 } as CreateListResult;
      mockConnection.executeQuery.mockResolvedValue(mockResult);

      const insertListInListTableSpy = jest
        .spyOn(createList, 'insertListInListTable')
        .mockResolvedValue(mockResult);
      await createList.handle(mockInput);

      expect(insertListInListTableSpy).toHaveBeenCalled();
      expect(updateListsUploadStatus).toHaveBeenCalledWith(
        undefined,
        1,
        'Insert row in List table'
      );
      expect(updateListsUploadStatus).toHaveBeenCalledWith(
        undefined,
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
          userId: 1,
          templateId: 1,
          path: 'test_path',
        },
      };

      jest.spyOn(createList, 'insertListInListTable').mockRejectedValue(new Error('Query failed'));

      await expect(createList.handle(mockInput)).rejects.toThrow('Query failed');
    });
  });
});
