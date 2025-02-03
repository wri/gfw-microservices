import { AddMewLocationToAnalysisTable } from './add.new.location.to.analysis.table';
import { AnalysisSchema, AnalysisSchemaType, ClientStoreConnection } from '@wri-monorepos/sql';
import { ChainType, RequestNewList } from './types';
import { DataSource, EntitySchema } from 'typeorm';

jest.mock('@wri-monorepos/sql');
jest.mock('typeorm');

describe('AddMewLocationToAnalysisTable', () => {
  let addMewLocationToAnalysisTable: AddMewLocationToAnalysisTable;
  let clientStoreConnection: ClientStoreConnection;
  let dataSource: DataSource;

  const AnalysisEntity = new EntitySchema<AnalysisSchemaType>({
    ...AnalysisSchema,
    name: 'analysis_test_table',
  });

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [AnalysisEntity],
      synchronize: true,
      logging: false,
    });

    clientStoreConnection = new ClientStoreConnection();

    // Mock the getConnection method to return the DataSource instance
    jest.spyOn(clientStoreConnection, 'getConnection').mockResolvedValue(dataSource);

    // Initialize the DataSource
    await dataSource.initialize();

    addMewLocationToAnalysisTable = new AddMewLocationToAnalysisTable(clientStoreConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle the request and insert new locations', async () => {
    const request: ChainType = {
      request: {
        organization_database: 'test_db',
        listTable: 'test_list',
      } as RequestNewList,
    };

    const mockLocationIds = [1, 2, 3];
    (addMewLocationToAnalysisTable.getAllLocationIds as jest.Mock).mockResolvedValue(
      mockLocationIds
    );

    await addMewLocationToAnalysisTable.handle(request);

    expect(clientStoreConnection.getConnection).toHaveBeenCalledWith('test_db', expect.any(Array));
    expect(addMewLocationToAnalysisTable.getAllLocationIds).toHaveBeenCalledWith(request);
  });
});
