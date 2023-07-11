import * as sql from 'mssql';
import { GenerationFileRequest } from '../llp';
import { getNumberPagesForAnalysisDataUserList } from './ClientDatabaseOperationsManager';
import { SQLUtils } from '../util/sql.utils';

const ORG_DB = 'clientstore-TestOrg';

jest.mock('../util/sql.utils', () => ({
  SQLUtils: {
    queryDB: jest.fn(),
  },
}));

describe('getNumberPagesForAnalysisDataUserList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the correct number of pages, number of results, and maximum analysis area', async () => {
    // Mock the SQLUtils.queryDB function to return the expected result
    const mockQueryDB = SQLUtils.queryDB as jest.Mock;
    const expectedRecordsets = [
      { statistic_type: 'Row Count', statistic: 100 }, // numberOfResults
      { statistic_type: '', statistic: 200 }, // maximumAnalysisAreaInTheList
    ];
    mockQueryDB.mockResolvedValue(expectedRecordsets);

    // Define the input parameters
    const organizationDatabase = ORG_DB;
    const filters: GenerationFileRequest = {
      country: null,
      listID: 5464,
      state: null,
      subState: null,
      rowsPerPage: 5,
      analysisAreaMin: '0',
      analysisAreaMax: null,
      searchString: null,
    };

    // Call the function
    const result = await getNumberPagesForAnalysisDataUserList(organizationDatabase, filters);

    const parameters = [
      { field: 'listID', type: sql.Int, value: filters.listID },
      { field: 'Country', type: sql.NVarChar, value: filters.country },
      { field: 'State', type: sql.NVarChar, value: filters.state },
      { field: 'SubState', type: sql.NVarChar, value: filters.subState },
      {
        field: 'AnalysisAreaMin',
        type: sql.Int,
        value: filters.analysisAreaMin,
      },
      {
        field: 'AnalysisAreaMax',
        type: sql.Int,
        value: filters.analysisAreaMax,
      },
      { field: 'SearchString', type: sql.Float, value: filters.searchString },
    ];

    // Verify the result
    expect(mockQueryDB).toHaveBeenCalledWith(
      organizationDatabase,
      'uspGetAnalysisDataCountForUserList',
      parameters
    );
    expect(result).toEqual({
      numberOfPages: 20,
      numberOfResults: 100,
      maximumAnalysisAreaInTheList: 200,
    });
  });

  it('should throw an error if the SQL query fails', async () => {
    // Mock SQLUtils.queryDB function to throw an error
    const mockQueryDB = SQLUtils.queryDB as jest.Mock;
    const error = new Error('Error: Database error');
    mockQueryDB.mockRejectedValue(error);

    const organizationDatabase = ORG_DB;
    const filters: GenerationFileRequest = {
      country: null,
      listID: 5464,
      state: null,
      subState: null,
      rowsPerPage: 5,
      analysisAreaMin: '0',
      analysisAreaMax: null,
      searchString: null,
    };

    // Call the function and expect it to throw an error
    await expect(
      getNumberPagesForAnalysisDataUserList(organizationDatabase, filters)
    ).rejects.toThrowError('Error: Database error');
  });
});
