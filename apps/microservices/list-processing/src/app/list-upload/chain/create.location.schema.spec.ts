import { CreateLocationSchema } from './create.location.schema';
import { SQLUtils } from '@wri-monorepos/sql';
import * as sql from 'mssql';

jest.mock('@wri-monorepos/sql');
jest.mock('../shared/update.lists.upload.status');

describe('CreateLocationSchema', () => {
  let createLocationSchema: CreateLocationSchema;
  let mockSQLUtils: jest.Mocked<SQLUtils>;

  beforeEach(() => {
    mockSQLUtils = new SQLUtils({} as sql.config) as jest.Mocked<SQLUtils>;
    createLocationSchema = new CreateLocationSchema(mockSQLUtils);
  });

  describe('createSqlParameter', () => {
    it('should create a SQL parameter object', () => {
      const param = createLocationSchema['createSqlParameter']('field', sql.Int, 123);
      expect(param).toEqual({ field: 'field', type: sql.Int, value: 123 });
    });
  });

  describe('executeQueryWithParams', () => {
    it('should execute a query with parameters', async () => {
      mockSQLUtils.executeQuery.mockResolvedValueOnce(undefined);
      await createLocationSchema['executeQueryWithParams'](mockSQLUtils, 'procedureName', [
        { field: 'field', type: sql.Int, value: 123 },
      ]);
      expect(mockSQLUtils.executeQuery).toHaveBeenCalledWith('procedureName', [
        { field: 'field', type: sql.Int, value: 123 },
      ]);
    });

    it('should throw an error if the query fails', async () => {
      mockSQLUtils.executeQuery.mockRejectedValueOnce(new Error('Query failed'));
      await expect(
        createLocationSchema['executeQueryWithParams'](mockSQLUtils, 'procedureName', [
          { field: 'field', type: sql.Int, value: 123 },
        ])
      ).rejects.toThrow();
    });
  });

  describe('createListTableInDatabase', () => {
    it('should create a list table in the database', async () => {
      mockSQLUtils.executeQuery.mockResolvedValueOnce(undefined);
      await createLocationSchema.createListTableInDatabase(mockSQLUtils, 'tableName', 'sqlQuery');
      expect(mockSQLUtils.executeQuery).toHaveBeenCalledWith('uspCreateListTable', [
        { field: 'table_name', type: sql.NVarChar(150), value: 'tableName' },
        { field: 'query_string', type: sql.NVarChar(sql.MAX), value: 'sqlQuery' },
      ]);
    });
  });

  describe('getTableStructureQuery', () => {
    it('should get the table structure query', async () => {
      SQLUtils.queryDB = jest.fn().mockResolvedValueOnce('');
      const someTemplateId = 13;
      await createLocationSchema.getTableStructureQuery(someTemplateId);
      expect(SQLUtils.queryDB).toHaveBeenCalledWith('gfwpro', 'uspGetTableQueryString', [
        { field: 'template_id', type: sql.Int, value: someTemplateId },
      ]);
    });
  });

  describe('createAnalysisTableInDatabase', () => {
    it('should create an analysis table in the database', async () => {
      mockSQLUtils.executeQuery.mockResolvedValueOnce(undefined);
      await createLocationSchema.createAnalysisTableInDatabase(mockSQLUtils, 'analysisTable');
      expect(mockSQLUtils.executeQuery).toHaveBeenCalledWith('uspCreateAnalysisTable', [
        { field: 'list_analysis_table_name', type: sql.NVarChar(150), value: 'analysisTable' },
      ]);
    });
  });

  describe('createAnalysisStatusRecords', () => {
    it('should create analysis status records', async () => {
      SQLUtils.queryDB = jest.fn().mockResolvedValueOnce(undefined);
      await createLocationSchema.createAnalysisStatusRecords('clientDatabase', 1, 2, ['analysis1']);
      expect(SQLUtils.queryDB).toHaveBeenCalledWith(
        'clientDatabase',
        'uspCreateListAnalysisStatus',
        [
          { field: 'ListID', type: sql.Int, value: 1 },
          { field: 'AnalysisID', type: sql.NVarChar(150), value: 'analysis1' },
          { field: 'Status', type: sql.Int, value: 2 },
        ]
      );
    });

    it('should throw an error if creating status records fails', async () => {
      SQLUtils.queryDB = jest.fn().mockRejectedValueOnce(new Error('Query failed'));
      await expect(
        createLocationSchema.createAnalysisStatusRecords('clientDatabase', 1, 2, ['analysis1'])
      ).rejects.toThrow('Failed to create analysis status records: Query failed');
    });
  });
});
