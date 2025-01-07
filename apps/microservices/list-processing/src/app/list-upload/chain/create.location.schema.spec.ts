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
      const someTemplateId = 13;

      jest.spyOn(SQLUtils.prototype, 'connect').mockResolvedValueOnce();
      jest.spyOn(SQLUtils.prototype, 'executeQuery').mockResolvedValueOnce('');

      await createLocationSchema.getTableStructureQuery(someTemplateId);

      expect(SQLUtils.prototype.executeQuery).toHaveBeenCalledWith('uspGetTableQueryString', [
        { field: 'template_id', type: sql.Int, value: someTemplateId },
        {
          field: 'custom_attribute_1',
          type: sql.NVarChar(50),
          value: null,
        },
        {
          field: 'custom_attribute_1_type',
          type: sql.NVarChar(50),
          value: null,
        },
        {
          field: 'custom_attribute_2',
          type: sql.NVarChar(50),
          value: null,
        },
        {
          field: 'custom_attribute_2_type',
          type: sql.NVarChar(50),
          value: null,
        },
        {
          field: 'custom_attribute_3',
          type: sql.NVarChar(50),
          value: null,
        },
        {
          field: 'custom_attribute_3_type',
          type: sql.NVarChar(50),
          value: null,
        },
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

    it('should not create a status record for PalmRisk, but should pass options="PalmRisk" if FCD is also present', async () => {
      SQLUtils.queryDB = jest.fn().mockResolvedValue(undefined);

      // both "FCD" and "PalmRisk" in the array (along with "analysisX" to show multiple IDs).
      const analysisIds = ['analysisX', 'FCD', 'PalmRisk'];

      await createLocationSchema.createAnalysisStatusRecords(
        'clientDatabase',
        100,
        200,
        analysisIds
      );
      expect(SQLUtils.queryDB).toHaveBeenCalledTimes(2);

      // 1) For "analysisX" (no options parameter):
      expect(SQLUtils.queryDB).toHaveBeenNthCalledWith(
        1,
        'clientDatabase',
        'uspCreateListAnalysisStatus',
        expect.arrayContaining([
          { field: 'ListID', type: sql.Int, value: 100 },
          { field: 'AnalysisID', type: sql.NVarChar(150), value: 'analysisX' },
          { field: 'Status', type: sql.Int, value: 200 },
        ])
      );

      // 2) For "FCD" (with options="PalmRisk"):
      expect(SQLUtils.queryDB).toHaveBeenNthCalledWith(
        2,
        'clientDatabase',
        'uspCreateListAnalysisStatus',
        expect.arrayContaining([
          { field: 'ListID', type: sql.Int, value: 100 },
          { field: 'AnalysisID', type: sql.NVarChar(150), value: 'FCD' },
          { field: 'Status', type: sql.Int, value: 200 },
          { field: 'options', type: sql.NVarChar(32), value: 'PalmRisk' },
        ])
      );
    });

    it('should not include options if PalmRisk is not in the array, even if FCD is present', async () => {
      SQLUtils.queryDB = jest.fn() as jest.Mock;

      const analysisIds = ['analysisX', 'FCD'];

      await createLocationSchema.createAnalysisStatusRecords('clientDatabase', 10, 20, analysisIds);

      expect(SQLUtils.queryDB).toHaveBeenCalledTimes(2);

      // check that for FCD, no 'options' field is present
      const secondCallParams = (SQLUtils.queryDB as jest.Mock).mock.calls[1][2]; // The third arg in the second call
      const optionsParam = secondCallParams.find((p: any) => p.field === 'options');
      expect(optionsParam).toBeUndefined();
    });
  });
});
