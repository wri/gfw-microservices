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

  describe('createAnalysisTableInDatabase', () => {
    it('should create an analysis table in the database', async () => {
      mockSQLUtils.executeQuery.mockResolvedValueOnce(undefined);
      await createLocationSchema.createAnalysisTableInDatabase(mockSQLUtils, 'analysisTable');
      expect(mockSQLUtils.executeQuery).toHaveBeenCalledWith('uspCreateAnalysisTable', [
        { field: 'list_analysis_table_name', type: sql.NVarChar(150), value: 'analysisTable' },
      ]);
    });
  });
});
